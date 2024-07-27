import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { UserService } from '../../pages/profile/services/user.service';
import { Observable, startWith, switchMap } from 'rxjs';
import { UserProfile } from '../profile/models/userProfile.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements OnInit {
  searchControl = new FormControl();
  filteredUsers!: Observable<UserProfile[]>;
  selectedUser: UserProfile | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.filteredUsers = this.searchControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) => this.userService.searchMutualUsers(value))
    );
  }

  onUserSelected(user: UserProfile): void {
    this.selectedUser = user;
    this.searchControl.setValue('');
  }
}
