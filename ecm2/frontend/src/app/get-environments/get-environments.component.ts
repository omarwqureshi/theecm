import { Component, OnInit, ViewChild } from '@angular/core';
import {ApiService} from '../shared/api.service';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import {Environment} from '../model/environment';

@Component({
  selector: 'app-get-environments',
  templateUrl: './get-environments.component.html',
  styleUrls: ['./get-environments.component.css']
})
export class GetEnvironmentsComponent implements OnInit {
  EnvironmentData: any = [];
  dataSource: MatTableDataSource<Environment>;
  @ViewChild(MatPaginator, { read: true, static: false }) paginator: MatPaginator;
  displayedColumns: string[] = ['environment_name', 'instanceid', 'status', 'ip', 'dnsname', 'deployment_environment', '_id', 'action'];
  constructor(private environmentApi: ApiService) {
    this.environmentApi.GetEnvironments().subscribe(data => {
      this.EnvironmentData = data;
      this.dataSource = new MatTableDataSource<Environment>(this.EnvironmentData);
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
      }, 0);
    });
   }

  ngOnInit() {
  }

  stopEnvironment(environment) {
    //const data = this.dataSource.data;
    console.log(environment);

    this.environmentApi.StopEnvironments(environment).subscribe((values) => console.log(values));
  }
  startEnvironment(environment) {
    console.log(environment);
    this.environmentApi.StartEnvironment(environment).subscribe((values) => console.log(values));
  }
  deleteEnvironment(environment) {
    console.log(environment);
    this.environmentApi.DeleteEnvironment(environment).subscribe((values)=>console.log(values));
  }

}
