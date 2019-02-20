import { Component, Injectable, OnInit, EmbeddedViewRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  AngularGridInstance,
  AngularUtilService,
  Column,
  Editors,
  FieldType,
  Filters,
  Formatters,
  GridOption,
  OnEventArgs,
  OperatorType,
} from './../modules/angular-slickgrid';
import { EditorNgSelectComponent } from './editor-ng-select.component';
import { CustomAngularComponentEditor } from './custom-angularComponentEditor';
import { CustomTitleFormatterComponent } from './custom-titleFormatter.component';

// using external non-typed js libraries
declare var Slick: any;
declare var $: any;

const NB_ITEMS = 100;

@Component({
  templateUrl: './grid-editor-angular.component.html'
})
@Injectable()
export class GridEditorAngularComponent implements OnInit {
  title = 'Example 22: Editors with Angular Components';
  subTitle = `
  Grid with Inline Editors and onCellClick actions (<a href="https://github.com/ghiscoding/Angular-Slickgrid/wiki/Editors" target="_blank">Wiki docs</a>).
  <ul>
    <li>Support of Angular Component as Custom Editor (click on "Assignee" column)</li>
    <li>The column "Assignee" shown below uses <a href="https://github.com/ng-select/ng-select" target="_blank">ng-select</a> as a custom editor with Angular Component
    <li>Increased rowHeight to 45 so that the "ng-select" fits in the cell. Ideally it would be better to override the ng-select component styling to change it's max height</li>
  </ul>
  `;

  private _commandQueue = [];
  angularGrid: AngularGridInstance;
  columnDefinitions: Column[];
  gridOptions: GridOption;
  dataset: any[];
  gridObj: any;
  isAutoEdit = true;
  alertWarning: any;
  updatedObject: any;
  selectedLanguage = 'en';
  assignees = [
    { id: '1', name: 'John' },
    { id: '2', name: 'Pierre' },
    { id: '3', name: 'Paul' },
  ];

  constructor(private angularUtilService: AngularUtilService, private translate: TranslateService) {}

  ngOnInit(): void {
    this.prepareGrid();
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid;
  }

  prepareGrid() {
    this.columnDefinitions = [
      {
        id: 'title',
        name: 'Title',
        field: 'title',
        minWidth: 100,
        filterable: true,
        sortable: true,
        type: FieldType.string,
        editor: {
          model: Editors.longText
        },
        onCellChange: (e: Event, args: OnEventArgs) => {
          console.log(args);
          this.alertWarning = `Updated Title: ${args.dataContext.title}`;
        }
      }, {
        id: 'assignee',
        name: 'Assignee',
        field: 'assignee',
        minWidth: 100,
        filterable: true,
        sortable: true,
        type: FieldType.string,
        formatter: Formatters.complexObject,
        params: {
          complexField: 'assignee.name',
        },
        exportWithFormatter: true,
        editor: {
          model: CustomAngularComponentEditor,
          collection: this.assignees,
          params: {
            angularUtilService: this.angularUtilService,
            component: EditorNgSelectComponent,
          }
        },
        onCellChange: (e: Event, args: OnEventArgs) => {
          console.log(args);
          this.alertWarning = `Updated Title: ${args.dataContext.title}`;
        }
      }, {
        id: 'assignee2',
        name: 'Assignee with Angular Component',
        field: 'assignee',
        minWidth: 100,
        filterable: true,
        sortable: true,
        type: FieldType.string,

        // loading formatter, text to display while Post Render gets processed
        formatter: () => '...',

        // to load an Angular Component, you cannot use a Formatter since Angular needs at least 1 cycle to render everything
        // you can use a PostRenderer but you will visually see the data appearing,
        // which is why it's still better to use regular Formatter (with jQuery if need be) instead of Angular Component
        asyncPostRender: this.renderAngularComponent.bind(this),
        params: {
          component: CustomTitleFormatterComponent,
          angularUtilService: this.angularUtilService,
        },
        exportWithFormatter: true,
      }, {
        id: 'duration',
        name: 'Duration (days)',
        field: 'duration',
        minWidth: 100,
        filterable: true,
        sortable: true,
        type: FieldType.number,
        filter: { model: Filters.slider, params: { hideSliderNumber: false } },
        editor: {
          model: Editors.slider,
          minValue: 0,
          maxValue: 100,
        }
      }, {
        id: 'complete',
        name: '% Complete',
        field: 'percentComplete',
        minWidth: 100,
        filterable: true,
        formatter: Formatters.multiple,
        type: FieldType.number,
        editor: {
          model: Editors.singleSelect,

          // We can also add HTML text to be rendered (any bad script will be sanitized) but we have to opt-in, else it will be sanitized
          enableRenderHtml: true,
          collection: Array.from(Array(101).keys()).map(k => ({ value: k, label: k, symbol: '<i class="fa fa-percent" style="color:cadetblue"></i>' })),
          customStructure: {
            value: 'value',
            label: 'label',
            labelSuffix: 'symbol'
          },

          // collection: Array.from(Array(101).keys()).map(k => ({ value: k, label: k, labelSuffix: '%' })),
          collectionSortBy: {
            property: 'label',
            sortDesc: true
          },
          collectionFilterBy: {
            property: 'value',
            value: 0,
            operator: OperatorType.notEqual
          },
          elementOptions: {
            maxHeight: 400
          }
        },
        params: {
          formatters: [Formatters.collectionEditor, Formatters.percentCompleteBar],
        }
      }, {
        id: 'start',
        name: 'Start',
        field: 'start',
        minWidth: 100,
        filterable: true,
        filter: { model: Filters.compoundDate },
        formatter: Formatters.dateIso,
        exportWithFormatter: true,
        sortable: true,
        type: FieldType.date,
        editor: {
          model: Editors.date
        },
      }, {
        id: 'finish',
        name: 'Finish',
        field: 'finish',
        minWidth: 100,
        filterable: true,
        sortable: true,
        filter: { model: Filters.compoundDate },
        formatter: Formatters.dateIso,
        exportWithFormatter: true,
        type: FieldType.date,
        editor: {
          model: Editors.date
        },
      }
    ];

    this.gridOptions = {
      asyncEditorLoading: false,
      autoEdit: this.isAutoEdit,
      autoCommitEdit: false,
      autoResize: {
        containerId: 'demo-container',
        sidePadding: 15
      },
      rowHeight: 45, // increase row height so that the ng-select fits in the cell
      editable: true,
      enableCellNavigation: true,
      enableColumnPicker: true,
      enableExcelCopyBuffer: true,
      enableFiltering: true,
      enableAsyncPostRender: true, // for the Angular PostRenderer, don't forget to enable it
      asyncPostRenderDelay: 0,    // also make sure to remove any delay to render it
      editCommandHandler: (item, column, editCommand) => {
        this._commandQueue.push(editCommand);
        editCommand.execute();
      },
      i18n: this.translate
    };

    this.dataset = this.mockData(NB_ITEMS);
  }

  mockData(itemCount, startingIndex = 0) {
    // mock a dataset
    const tempDataset = [];
    for (let i = startingIndex; i < (startingIndex + itemCount); i++) {
      const randomYear = 2000 + Math.floor(Math.random() * 10);
      const randomMonth = Math.floor(Math.random() * 11);
      const randomDay = Math.floor((Math.random() * 29));
      const randomPercent = Math.round(Math.random() * 100);

      tempDataset.push({
        id: i,
        title: 'Task ' + i,
        assignee: i % 3 ? this.assignees[2] : i % 2 ? this.assignees[1] : this.assignees[0],
        duration: Math.round(Math.random() * 100) + '',
        percentComplete: randomPercent,
        percentCompleteNumber: randomPercent,
        start: new Date(randomYear, randomMonth, randomDay),
        finish: new Date(randomYear, (randomMonth + 1), randomDay),
        effortDriven: (i % 5 === 0),
      });
    }
    return tempDataset;
  }

  onCellChanged(e, args) {
    this.updatedObject = args.item;
  }

  onCellClicked(e, args) {
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    console.log(metadata);

    if (metadata.columnDef.id === 'edit') {
      this.alertWarning = `open a modal window to edit: ${metadata.dataContext.title}`;

      // highlight the row, to customize the color, you can change the SASS variable $row-highlight-background-color
      this.angularGrid.gridService.highlightRow(args.row, 1500);

      // you could also select the row, when using "enableCellNavigation: true", it automatically selects the row
      // this.angularGrid.gridService.setSelectedRow(args.row);
    } else if (metadata.columnDef.id === 'delete') {
      if (confirm('Are you sure?')) {
        this.angularGrid.gridService.deleteDataGridItemById(metadata.dataContext.id);
      }
    }
  }

  onCellValidation(e, args) {
    alert(args.validationResults.msg);
  }

  changeAutoCommit() {
    this.gridOptions.autoCommitEdit = !this.gridOptions.autoCommitEdit;
    this.gridObj.setOptions({
      autoCommitEdit: this.gridOptions.autoCommitEdit
    });
    return true;
  }

  setAutoEdit(isAutoEdit) {
    this.isAutoEdit = isAutoEdit;
    this.gridObj.setOptions({ autoEdit: isAutoEdit }); // change the grid option dynamically
    return true;
  }

  undo() {
    const command = this._commandQueue.pop();
    if (command && Slick.GlobalEditorLock.cancelCurrentEdit()) {
      command.undo();
      this.gridObj.gotoCell(command.row, command.cell, false);
    }
  }

  renderAngularComponent(cellNode: HTMLElement, row: number, dataContext: any, colDef: Column) {
    if (colDef.params.component) {
      const componentOutput = this.angularUtilService.createAngularComponent(colDef.params.component);
      Object.assign(componentOutput.componentRef.instance, { item: dataContext });

      // use a delay to make sure Angular ran at least a cycle and it finished rendering the Component
      setTimeout(() => $(cellNode).empty().html($(componentOutput.domElement).html()));
    }
  }
}
