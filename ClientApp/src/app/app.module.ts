import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { RoomsComponent } from './rooms/rooms.component';
import { ParticipantsComponent } from './participants/participants.component';
import { CameraComponent } from './camera/camera.component';
import { SettingsComponent } from './settings/settings.component';
import { DeviceSelectComponent } from './settings/device-select.component';
import { ActivityIndicatorComponent } from './activity-indicator/activity-indicator.component';

import { VideoChatService } from './services/videochat.service';
import { DeviceService } from './services/device.service';
import { StorageService } from './services/storage.service';
import { RouterModule } from '@angular/router';
import { ChatRoomComponent } from './chat-room/chat-room.component';

var routes = [
    {path: 'chat/:room',component:ChatRoomComponent},
    {path: 'home',component:HomeComponent},
    {path: '', pathMatch:'full',redirectTo:'chat/claim_101010239'},
    {path: '*',pathMatch:'full',redirectTo:'chat/claim_101010239'}
];
@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        RoomsComponent,
        ParticipantsComponent,
        CameraComponent,
        SettingsComponent,
        DeviceSelectComponent,
        ActivityIndicatorComponent,
        ChatRoomComponent
    ],
    imports: [
        BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
        RouterModule.forRoot(routes),
        HttpClientModule,
        FormsModule
    ],
    providers: [DeviceService, VideoChatService, StorageService],
    bootstrap: [AppComponent]
})
export class AppModule { }
