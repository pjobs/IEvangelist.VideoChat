import { Component, OnInit, ViewChild } from '@angular/core';
import { VideoChatService } from '../services/videochat.service';
import { HubConnectionBuilder, LogLevel, HubConnection } from '@microsoft/signalr';
import { Room, RemoteParticipant, LocalTrack, LocalAudioTrack, LocalVideoTrack } from 'twilio-video';
import { environment as env } from '../../environments/environment';
import { RoomsComponent } from '../rooms/rooms.component';
import { ParticipantsComponent } from '../participants/participants.component';
import { CameraComponent } from '../camera/camera.component';
import { SettingsComponent } from '../settings/settings.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-chat-room',
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.css']
})
export class ChatRoomComponent implements OnInit {
  @ViewChild('rooms', { static: false }) rooms: RoomsComponent;
  @ViewChild('camera', { static: false }) camera: CameraComponent;
  @ViewChild('settings', { static: false }) settings: SettingsComponent;
  @ViewChild('participants', { static: false }) participants: ParticipantsComponent;

  activeRoom: Room;

  private notificationHub: HubConnection;

  constructor(private readonly videoChatService: VideoChatService, private route: ActivatedRoute) { }

  async ngOnInit() {
    const builder =
      new HubConnectionBuilder()
        .configureLogging(LogLevel.Information)
        .withUrl(`${env.apiUrl}/notificationHub`);

    this.notificationHub = builder.build();
    this.notificationHub.on('RoomsUpdated', async updated => {
      if (updated) {
        await this.rooms.updateRooms();
      }
    });
    await this.notificationHub.start();
    this.route.params.subscribe(param => {
      let roomName = param["room"];
      this.onRoomChanged(roomName);
    })
  }

  async onSettingsChanged(deviceInfo: MediaDeviceInfo) {
    await this.camera.initializePreview(deviceInfo);
  }

  async onLeaveRoom(_: boolean) {
      if (this.activeRoom) {
          this.activeRoom.disconnect();
          this.activeRoom = null;
      }

      this.camera.finalizePreview();
      const videoDevice = this.settings.hidePreviewCamera();
      this.camera.initializePreview(videoDevice);

      this.participants.clear();
  }

  async onRoomChanged(roomName: string) {
      if (roomName) {
          if (this.activeRoom) {
              this.activeRoom.disconnect();
          }

          this.camera.finalizePreview();
          const tracks = await this.settings.showPreviewCamera();

          this.activeRoom =
              await this.videoChatService
                        .joinOrCreateRoom(roomName, tracks);

          this.participants.initialize(this.activeRoom.participants);
          this.registerRoomEvents();

          this.notificationHub.send('RoomsUpdated', true);
      }
  }

  onParticipantsChanged(_: boolean) {
      this.videoChatService.nudge();
  }

  private registerRoomEvents() {
      this.activeRoom
          .on('disconnected',
              (room: Room) => room.localParticipant.tracks.forEach(publication => this.detachLocalTrack(publication.track)))
          .on('participantConnected',
              (participant: RemoteParticipant) => this.participants.add(participant))
          .on('participantDisconnected',
              (participant: RemoteParticipant) => this.participants.remove(participant))
          .on('dominantSpeakerChanged',
              (dominantSpeaker: RemoteParticipant) => this.participants.loudest(dominantSpeaker));
  }

  private detachLocalTrack(track: LocalTrack) {
      if (this.isDetachable(track)) {
          track.detach().forEach(el => el.remove());
      }
  }

  private isDetachable(track: LocalTrack): track is LocalAudioTrack | LocalVideoTrack {
      return !!track
          && ((track as LocalAudioTrack).detach !== undefined
          || (track as LocalVideoTrack).detach !== undefined);
  }
}