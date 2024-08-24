import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RateAppDialogComponent } from './rate-app-dialog.component';

describe('RateAppDialogComponent', () => {
  let component: RateAppDialogComponent;
  let fixture: ComponentFixture<RateAppDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RateAppDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RateAppDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
