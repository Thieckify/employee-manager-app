import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it("crée l'application", () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('affiche la marque et la navigation principale', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const racine = fixture.nativeElement as HTMLElement;

    const liens = Array.from(racine.querySelectorAll('nav a')).map((a) => a.textContent?.trim());

    expect(racine.querySelector('.marque')?.textContent).toContain('Employee Manager');
    expect(liens).toEqual(['Équipe', 'Ajouter']);
  });
});
