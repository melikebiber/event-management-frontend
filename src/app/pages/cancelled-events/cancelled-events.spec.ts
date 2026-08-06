import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelledEvents } from './cancelled-events';

describe('CancelledEvents', () => {
  let component: CancelledEvents;
  let fixture: ComponentFixture<CancelledEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelledEvents],
    }).compileComponents();

    fixture = TestBed.createComponent(CancelledEvents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
