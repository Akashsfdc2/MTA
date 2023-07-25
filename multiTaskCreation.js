import { LightningElement, track, wire} from 'lwc';
import GETRECBYOBJ from '@salesforce/apex/multiTask.getRecByObj';
import CREATERECS from '@salesforce/apex/createmultitask.createRecs';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import sentUpdateMail from '@salesforce/apex/MassUpdateEmail.sendMail';
import PRIORITY_FIELD from '@salesforce/schema/Task.Priority';
import STATUS_FIELD from '@salesforce/schema/Task.Status';
export default class MultiTaskCreation extends LightningElement {







handleRecordsPerPage(event) {
        this.pageSize = event.target.value;
        this.paginationHelper();
    }

selectObj=true;
keyWord='';
ObjectApiName="Object Name..";
ObjectName;
icon="standard:entity";
isObjselected="Select Object";
noRecords=false;
selectedRecs;
selectedRecsCount;
selectedRecIds;
statusPicklistValue=[];
priorityPicklistValue=[];
selectFieldsPopup=false;
subValue;
dudateValue;
statusValue = 'Not Started';
priorityValue;
assignedTovalue;
recordIds=[];
dataList=[];

 @wire (getPicklistValues,{
      recordTypeId:'012000000000000AAA',
      fieldApiName: STATUS_FIELD
    })
    wiredstatusPicklistValue({data,error}){
      if(data){
        console.log('DATA',data)
        
        this.statusPicklistValue=data.values;
      }
      if(error){
        console.log('ERROR',error)
      }
    }
    @wire (getPicklistValues,{
      recordTypeId:'012000000000000AAA',
      fieldApiName: PRIORITY_FIELD
    })
    wiredpriorityPicklistValue({data,error}){
      if(data){
        console.log('DATA',data)
        this.priorityPicklistValue=data.values;
      }
      if(error){
        console.log('ERROR',error)
      }
    }
    handlechangeSubject(event){
      this.subValue=event.target.value

    }
    handleChangepriority(event){
      this.priorityValue=event.target.value

    }
    handlechangeDuedate(event){
      this.dudateValue=event.target.value
      //Date().toLocaleDateString
      console.log('this.dudateValue SS'+this.dudateValue)
      let checkDate=this.template.querySelector(".DateField");
        let dtValue = new Date(checkDate.value);
        var ToDate = new Date();
          let selectedDate1= dtValue.setHours(0,0,0,0)
        let currentDate=ToDate.setHours(0,0,0,0);
               console.log('todayToDate.getDate()',ToDate.getDate())
        if (selectedDate1 < currentDate) {
            checkDate.setCustomValidity("You Can't Select Previous Date");
        } else {
        //if(new Date(dtValue).getDate() >= ToDate.getDate()) {
            checkDate.setCustomValidity("");
        }
        checkDate.reportValidity();

    }
    // handlechangeDuedate(){
    //   this.dudateValue=event.target.value
    //   console.log('DudateValue'+this.dudateValue)
    //    let checkDate=this.template.querySelector(".DateField");
    //    let dtValue= new Date(checkDate.value);
    //    console.log('dtValue'+dtValue);
    //    var Todate = new Date ();
    //    console.log('Todate'+Todate);

    // }



    handleChangestatus(event){
      this.statusValue=event.target.value

    }
 @track columnsList;
 get options() {
        return [
            { label: 'Account', value: 'Account'},
            { label: 'Opportunity', value: 'Opportunity' },
            { label: 'Case', value: 'Case' },
            { label: 'Contact', value: 'Contact' },
            { label: 'Lead', value: 'Lead' },
            // { label: 'Student', value: 'Student' }
        ];
    }

dataList;
// handleselectedObj(event){
//     GETRECBYOBJ({objApiName:event.detail.value}) 
//     .then(result =>{
//               this.dataList= result;

//        console.log(this.dataList)
//     })
//     .catch(error=>{
// console.log(error)
//     })
    
// this.ObjectApiName=event.detail.value;

// this.selectObj=false;

// }

changeObj(){
    this.selectObj=true;
}
closesfillInfoPopup(){
    this.selectFieldsPopup=false
      this.template.querySelector('lightning-datatable').selectedRows=[];
}
handleChangeobj(event){
this.ObjectApiName=event.detail.value;
}
ondone(){
     GETRECBYOBJ({objApiName:this.ObjectApiName , keywords:this.keyWord}) 
    .then(result =>{
        this.dataList= result;
       console.log('Assigned To data',this.dataList)
       this.isObjselected="Change Object";
    })
    .catch(error=>{
console.log(error)
    })
    if(this.ObjectApiName=="Account"){
    this.columnsList=[
    {label:'Name', fieldName:'Name', hideDefaultActions: true},
    {label:'Type', fieldName:'Type', hideDefaultActions: true}

];
    this.ObjectName=this.ObjectApiName
    this.icon="standard:account";
    }
   
    if(this.ObjectApiName=="Opportunity"){
    this.columnsList=[
    {label:'Name', fieldName:'Name',hideDefaultActions: true},
    {label:'Stage', fieldName:'StageName',hideDefaultActions: true}
    
];
    this.ObjectName=this.ObjectApiName
    this.icon="standard:opportunity";

    }
    if(this.ObjectApiName=="Case"){
    this.columnsList=[
    {label:'Case No', fieldName:'CaseNumber', hideDefaultActions: true},
    {label:'Subject', fieldName:'Subject', hideDefaultActions: true}
    
];
    this.ObjectName=this.ObjectApiName
    this.icon="standard:case";

    }
    if(this.ObjectApiName=="Lead"){
    this.columnsList=[
    {label:'Name', fieldName:'Name',hideDefaultActions: true},
    {label:'Status', fieldName:'Status',hideDefaultActions: true}
    
];
    this.ObjectName=this.ObjectApiName
    this.icon="standard:lead";

    }
    if(this.ObjectApiName=="Student"){
    this.columnsList=[
    {label:'Roll No', fieldName:'MTA14__Roll_Number__c',hideDefaultActions: true},
    {label:'Name', fieldName:'Name',hideDefaultActions: true}
    
];
    this.ObjectName="MTA14__Student__c";
    this.icon="standard:avatar";

    }
    if(this.ObjectApiName=="Contact"){
    this.columnsList=[
    {label:'Name', fieldName:'Name',hideDefaultActions: true},
    {label:'Mobile', fieldName:'MobilePhone',hideDefaultActions: true}
    
];
    this.ObjectName=this.ObjectApiName
    this.icon="standard:contact";

    }

    this.selectObj=false;
}
createMultiTask(){
this.selectedRecs=this.template.querySelector('lightning-datatable').getSelectedRows();
      console.log('this.selectedRecs',JSON.stringify(this.selectedRecs))
      this.selectedRecsCount=this.selectedRecs.length;
      console.log('selectedRecsCount'+this.selectedRecsCount)
      
        const getIds=this.selectedRecs.map(records=>records.Id);
        this.selectedRecIds=getIds

      if(this.selectedRecsCount>=1){
        const getIds=this.selectedRecs.map(records=>records.Id);
        this.selectedRecIds=getIds
        console.log('selectedRecIds'+this.selectedRecIds)
        this.selectFieldsPopup=true;
       }
      else if (this.selectedRecsCount<1) {
              console.log('selectedRecsCount is 0')
        const showerr= new ShowToastEvent({
          title:'',
          message:'Please Select the records',
          variant:'error'

        });
        this.dispatchEvent(showerr);
      }



}
handleSearchTermChange(event){
    this.keyWord=event.target.value;
GETRECBYOBJ({objApiName:this.ObjectApiName , keywords:this.keyWord}) 
    .then(result =>{
        this.dataList= result;
       console.log(this.dataList)

       if (result != null) {

        this.totalRecords = this.result.length; // update total records count                 
        this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
        this.paginationHelper(); // call helper menthod to update pagination logic 
  
      }

       if(this.dataList.length==0){
         this.noRecords=true;
       }
       else if(this.dataList.length>=1){
         this.noRecords=false;
       }
    })
    .catch(error=>{
console.log(error)
    })
}
handlesave(){
  console.log('handleSave...')
  if(this.subValue ==null || this.priorityValue==null || this.statusValue==null || this.dudateValue==null || this.assignedTovalue == null ){
     const showerr= new ShowToastEvent({
          title: 'Please',
          message:'Fill the Required Fields ',
          variant:'error'

        });
        this.dispatchEvent(showerr);
  }

  else if (this.subValue!=null && this.priorityValue!=null && this.statusValue!=null && this.dudateValue !=null && this.assignedTovalue  !=null  ){
  
CREATERECS({Ids:this.selectedRecIds,objapiname:this.ObjectName,sub:this.subValue ,priority:this.priorityValue , status:this.statusValue, duedate:this.dudateValue ,assignedto : this.assignedTovalue })
.then(result=>{
            const records = result;
            console.log('recordIds', this.recordIds)
            this.recordIds = records.map(record => record.Id);
            console.log('recordIds', this.recordIds)
            sentUpdateMail({TaskIds:this.recordIds, toUserId:this.assignedTovalue});
           const showerr= new ShowToastEvent({
          title: this.selectedRecsCount+' Tasks',
          message:'Created Successfully',
          variant:'success'

        });
        this.dispatchEvent(showerr);
        this.selectFieldsPopup=false;
        this.template.querySelector('lightning-datatable').selectedRows=[];
        
                })
  }

 

}
lookupRecord(event){
       this.assignedTovalue=event.detail.selectedRecord.Id;
        console.log('Selected Record Value on Parent Component is ' +  JSON.stringify(event.detail.selectedRecord));
    }
 cancel()
  {
     this.selectObj=false;
     
  }

  pageSizeOptions = [5, 10, 25, 50, 75, 100]; //Page size options
  records = []; //All records available in the data table
  columns = []; //columns information available in the data table
  totalRecords = 0; //Total no.of records
  pageSize; //No.of records to be displayed per page
  totalPages; //Total no.of pages
  pageNumber = 1; //Page number    
  recordsToDisplay = []; //Records to be displayed on the page
  

  get bDisableFirst() {
      return this.pageNumber == 1;
  }

  get bDisableLast() {
      return this.pageNumber == this.totalPages;
  }

  handleRecordsPerPage(event) {
    this.pageSize = event.target.value;
    this.paginationHelper();
}

previousPage() {
    this.pageNumber = this.pageNumber - 1;
    this.paginationHelper();
}

nextPage() {
    this.pageNumber = this.pageNumber + 1;
    this.paginationHelper();
}

firstPage() {
    this.pageNumber = 1;
    this.paginationHelper();
}

lastPage() {
    this.pageNumber = this.totalPages;
    this.paginationHelper();
}


  // JS function to handel pagination logic 
  paginationHelper() {
    this.tasks = [];
    // calculate total pages
    this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
    // set page number 
    if (this.pageNumber <= 1) {
        this.pageNumber = 1;
    } else if (this.pageNumber >= this.totalPages) {
        this.pageNumber = this.totalPages;
    }

    // set records to display on current page 
    for (let i = (this.pageNumber - 1) * this.pageSize; i < this.pageNumber * this.pageSize; i++) {
        if (i === this.totalRecords) {
            break;
        }
        this.tasks.push(this.result[i]);
    }
}

}
