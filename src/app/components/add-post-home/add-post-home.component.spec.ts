import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPostHomeComponent } from './add-post-home.component';

describe('AddPostHomeComponent', () => {
  let component: AddPostHomeComponent;
  let fixture: ComponentFixture<AddPostHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddPostHomeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddPostHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
