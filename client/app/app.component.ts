// client/app/app.component.ts

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DataService } from './data-service/data.service';
// import { NgModel } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app/app.component.html',
  styleUrls: [ './app/app.component.css' ],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent implements OnInit {
  data1: Array<any>;
  data2: Array<any>;
  sort: boolean = true;
  startDate: string = '2017-01-01';
  endDate: string = new Date().toISOString();

  constructor( private dataService: DataService) {

    this.data1 = [
      ["ACCESSORY/STORAGE", "BUSINESS", "CIRCULATION", "CIRCULATE", "MEET", "OPERATE", "SERVE", "WASH", "WORK"],
      [0, 0, 0, 0, 0, 43, 0, 0, 0],
      [0, 0, 0, 0, 53, 0, 34, 9, 278],
      [0, 0, 0, 25, 0, 0, 0, 0, 0],
      [0, 0, 25, 0, 0, 0, 0, 0, 0],
      [0, 53, 0, 0, 0, 0, 0, 0, 0],
      [43, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 34, 0, 0, 0, 0, 0, 0, 0],
      [0, 9, 0, 0, 0, 0, 0, 0, 0],
      [0, 278, 0, 0, 0, 0, 0, 0, 0]
    ];

    this.data2 = [
    //   ["GroupMe", "Drew", "Adam Perks", "David Hazlett", "Kelsey Kuzmic", "🚀", "Billy", "Dober", "Morgan Allen", "Andy Brennan", "Ben Reith", "Nicole Nagorny", "Indy", "Kko", "Jacob Brown", "Count Bot", "Zo", "Alex Hughes", "Ross Antonacci", "Countess Bot", "Kelly Ross", "Tyler", "RoboDober"],
    //   [0, 2, 35, 1, 11, 0, 21, 79, 3, 0, 7, 2, 1, 1, 1, 0, 0, 0, 0, 0, 31, 20, 11],
    //   [0, 0, 55, 1, 11, 5, 61, 118, 3, 0, 16, 14, 7, 14, 0, 0, 0, 0, 0, 0, 129, 97, 4],
    //   [0, 15, 20, 27, 159, 4, 208, 705, 17, 0, 176, 11, 70, 31, 0, 0, 0, 0, 0, 0, 743, 507, 69],
    //   [0, 0, 6, 0, 1, 0, 1, 5, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
    //   [0, 0, 21, 8, 1, 1, 21, 116, 2, 0, 11, 0, 4, 0, 0, 0, 0, 2, 0, 0, 20, 41, 20],
    //   [0, 0, 1, 0, 0, 0, 11, 10, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 4, 9, 1],
    //   [0, 3, 136, 10, 90, 3, 1, 448, 115, 0, 48, 53, 97, 16, 0, 0, 0, 0, 0, 0, 264, 344, 56],
    //   [0, 9, 613, 21, 419, 5, 664, 2, 91, 0, 199, 28, 166, 74, 2, 0, 0, 0, 0, 0, 473, 537, 148],
    //   [0, 3, 78, 0, 39, 2, 215, 285, 3, 0, 27, 25, 14, 7, 0, 0, 0, 0, 0, 0, 80, 124, 15],
    //   [0, 0, 0, 0, 0, 0, 4, 6, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0],
    //   [0, 2, 677, 20, 185, 6, 192, 732, 80, 0, 39, 35, 80, 18, 0, 0, 0, 0, 0, 0, 502, 545, 57],
    //   [0, 4, 65, 1, 111, 0, 185, 229, 32, 0, 17, 1, 32, 4, 0, 0, 0, 0, 0, 0, 73, 115, 12],
    //   [0, 1, 222, 0, 116, 4, 168, 420, 39, 0, 60, 56, 1, 10, 0, 0, 0, 0, 0, 0, 162, 294, 27],
    //   [0, 0, 69, 4, 3, 0, 68, 114, 9, 0, 13, 3, 12, 0, 0, 0, 0, 0, 0, 0, 75, 41, 1],
    //   [0, 0, 2, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 1],
    //   [0, 8, 127, 8, 19, 4, 120, 305, 9, 0, 118, 13, 41, 46, 0, 0, 0, 0, 0, 0, 122, 181, 11],
    //   [0, 0, 7, 0, 0, 0, 0, 5, 0, 0, 8, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0],
    //   [0, 0, 0, 3, 3, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    //   [0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 16, 2, 21, 0, 47, 73, 1, 0, 16, 9, 2, 0, 0, 0, 0, 0, 0, 0, 3, 11, 18],
    //   [0, 12, 348, 19, 73, 4, 192, 448, 35, 0, 53, 13, 43, 17, 0, 0, 0, 0, 0, 0, 0, 338, 44],
    //   [0, 21, 371, 10, 170, 4, 425, 713, 37, 0, 119, 65, 47, 32, 1, 0, 0, 0, 0, 0, 440, 18, 53],
    //   [0, 0, 22, 0, 114, 0, 48, 239, 4, 0, 25, 26, 3, 1, 0, 0, 0, 0, 0, 0, 43, 95, 1]
    ];

  }
  
  ngOnInit() {
    this.dataService.get(this.startDate, this.endDate).subscribe(
        /* happy path */ d => this.data2 = d,
        /* error path */ e => this.errorMessage = e,
        /* onCompleted */ () => this.isLoading = false);
  }
  
  Existing(){
    this.sort = !this.sort;
    // console.log(this.sort);
  }
  
  updateLikeMatrix() {
        this.dataService.get(this.startDate, this.endDate).subscribe(
        /* happy path */ d => this.data2 = d,
        /* error path */ e => this.errorMessage = e,
        /* onCompleted */ () => this.isLoading = false);
        // console.log(this.data2);
  }

}