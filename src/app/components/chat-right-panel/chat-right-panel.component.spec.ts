import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRightPanelComponent } from './chat-right-panel.component';

describe('ChatRightPanelComponent', () => {
  let component: ChatRightPanelComponent;
  let fixture: ComponentFixture<ChatRightPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChatRightPanelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChatRightPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
