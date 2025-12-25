import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompProperties } from './comp-properties';

describe('CompProperties', () => {
  let component: CompProperties;
  let fixture: ComponentFixture<CompProperties>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompProperties]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompProperties);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
