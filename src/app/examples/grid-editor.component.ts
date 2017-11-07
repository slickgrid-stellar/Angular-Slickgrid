import { Component, OnInit } from '@angular/core';
import { Column, Editors, FieldType, Formatter, Formatters, GridExtraUtils, GridOption, OnEventArgs, ResizerService } from './../modules/angular-slickgrid';

@Component({
  templateUrl: './grid-editor.component.html'
})
export class GridEditorComponent implements OnInit {
  title = 'Example 3: Editors';
  subTitle = `
  Grid with Inline Editors and onCellClick actions (<a href="https://github.com/ghiscoding/Angular-Slickgrid/wiki/Editors">Wiki link</a>).
  `;

  columnDefinitions: Column[];
  gridOptions: GridOption;
  dataset: any[];
  isAutoEdit: boolean = true;
  updatedObject: any;
  gridObj: any;
  dataviewObj: any;

  constructor(private resizer: ResizerService) {}

  ngOnInit(): void {
    this.columnDefinitions = [
      {
        id: 'edit', field: 'id',
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        onCellClick: (args: OnEventArgs) => {
          console.log(args);
        }
      },
      {
        id: 'delete', field: 'id',
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        onCellClick: (args: OnEventArgs) => {
          console.log(args);
        }
      },
      { id: 'title', name: 'Title', field: 'title', sortable: true, type: FieldType.string, editor: Editors.longText },
      { id: 'duration', name: 'Duration (days)', field: 'duration', sortable: true, type: FieldType.number, editor: Editors.text,
        onCellChange: (args: OnEventArgs) => {
        alert('onCellChange directly attached to the column definition');
        console.log(args);
        }
      },
      { id: 'complete', name: '% Complete', field: 'percentComplete', formatter: Formatters.percentCompleteBar, type: FieldType.number, editor: Editors.integer },
      { id: 'start', name: 'Start', field: 'start', formatter: Formatters.dateIso, sortable: true, type: FieldType.date/*, editor: Editors.date*/ },
      { id: 'finish', name: 'Finish', field: 'finish', formatter: Formatters.dateIso, sortable: true, type: FieldType.date },
      { id: 'effort-driven', name: 'Effort Driven', field: 'effortDriven', formatter: Formatters.checkmark, type: FieldType.number, editor: Editors.checkbox }
    ];

    this.gridOptions = {
      autoResize: {
        containerId: 'demo-container',
        sidePadding: 15
      },
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      asyncEditorLoading: false,
      autoEdit: this.isAutoEdit
    };

    // mock a dataset
    let mockedDataset = [];
    for (let i = 0; i < 1000; i++) {
      const randomYear = 2000 + Math.floor(Math.random() * 10);
      const randomMonth = Math.floor(Math.random() * 11);
      const randomDay = Math.floor((Math.random() * 29));
      const randomPercent = Math.round(Math.random() * 100);

      mockedDataset[i] = {
        id: i,
        title: 'Task ' + i,
        duration: Math.round(Math.random() * 100) + '',
        percentComplete: randomPercent,
        percentCompleteNumber: randomPercent,
        start: new Date(randomYear, randomMonth, randomDay),
        finish: new Date(randomYear, (randomMonth + 1), randomDay),
        effortDriven: (i % 5 === 0)
      };
    }
    this.dataset = mockedDataset;
  }

  gridReady(grid) {
    this.gridObj = grid;

    grid.onCellChange.subscribe((e, args) => {
      console.log('onCellChange', args);
      this.updatedObject = args.item;
      this.resizer.resizeGrid(this.gridObj, this.gridOptions, 10);
    });
    grid.onClick.subscribe((e, args) => {
      const column = GridExtraUtils.getColumnDefinitionAndData(args);
      console.log('onClick', args, column);
      if (column.columnDef.id === 'edit') {
        alert('open a modal window to edit: ' + column.dataContext.title);
      } else if (column.columnDef.id === 'delete') {
        if (confirm('Are you sure?')) {
          this.dataviewObj.deleteItem(column.dataContext.id);
          this.dataviewObj.refresh();
        }
      }
    });

  }
  dataviewReady(dataview) {
    this.dataviewObj = dataview;
  }

  setAutoEdit(isAutoEdit) {
    this.isAutoEdit = isAutoEdit;
    this.gridObj.setOptions({ autoEdit: isAutoEdit }); // change the grid option dynamically
    return true;
  }
}
