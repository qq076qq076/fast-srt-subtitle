import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  set(key: string, content: any) {
    localStorage.setItem(key, JSON.stringify(content));
  }

  get(key: string) {
    const data = localStorage.getItem(key);
    return JSON.parse(data);
  }

}
