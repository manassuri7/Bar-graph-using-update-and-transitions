const svg=d3.select('.canvas')
      .append('svg')//creating an svg in index,js instead of in index.html
        .attr('width',600)
        .attr('height',600);
//create margins and dimensions
const margin={top:20,right:20,bottom:100,left:100}
const graphWidth=600-margin.left-margin.right;
const graphHeight=600-margin.top-margin.bottom;

const graph=svg.append('g')
      .attr('width',graphWidth)
      .attr('height',graphHeight)
      .attr('transform',`translate(${margin.left},${margin.top})`)//to shift the group from left and top

const xAxisGroup=graph.append('g')//to generate x -axis and y-axis
      .attr('transform',`translate(0,${graphHeight})`);
const yAxisGroup=graph.append('g');      //done at bottom

//scales
const y=d3.scaleLinear()//scaling on y axis
          .range([graphHeight,0]);

const x=d3.scaleBand()
          .range([0,500])    //means my whole graph ends at 500 px from left
          .paddingInner(0.2)  //adding the gaping between bars and outer as well
          .paddingOuter(0.2);  

          //create the axes
  const xAxis=d3.axisBottom(x);
  const yAxis=d3.axisLeft(y)
        .ticks(3) //to format no of ticks
        .tickFormat(d=>d+'orders'); //to add string to the ticks eg:500 orders

        //updates x axis text
        xAxisGroup.selectAll('text')
        .attr('transform','rotate(-40)')
        .attr('text-anchor','end')//so tht text doesn't go up
        .attr('fill','orange'); 
   const t=d3.transition().duration(500);            

//update function
const update=(data)=>{
   //1.update scales if they rely on our data
   y.domain([0,d3.max(data,d=>d.orders)])
   x.domain(data.map(item=>item.name))   //item means the full obj  
          //this returns a new array 
          
   //2.join updated data inside the element
   const rects=graph.selectAll('rect')
        .data(data);
    
   //3.remove any unwanted shapes using the exit selection
   rects.exit().remove;  //exit is used to remove an element from DOM    
   
   //4.Update the current shapes in DOM
   rects.attr('width',x.bandwidth)
        
       .attr('fill','orange')
       .attr('x',(d)=>x(d.name))   //moves away from left by the orders in px 
       .transition().duration(500)
       .attr('height',d=>graphHeight -y(d.orders))   
       .attr('y',(d)=>y(d.orders));  //bar starts from here
       
   //5. address the enter selection
    //append the enter selection to DOM
   rects.enter()                                              //Transitions(starting condn)
   .append('rect')                                                         // Y=graphHeight
    .attr('width',0)                                                                      // Height=0
   .attr('height',0) 
   .attr('fill','orange')                                             // ending conditions
   .attr('x',d=>x(d.name))                                                 // Y=y(d.orders)
   .attr('y',graphHeight)                                                  // Height=graphHeight-y(d.orders)
   .transition().duration(500)  
        
//transition to below
       .attr('height',d=>graphHeight-y(d.orders))   
       .attr('y',(d)=>y(d.orders));//
       

//calling the x and y axis
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);     

};

db.collection('dishes').get().then(res=>{
    var data=[];
    res.docs.forEach(doc=>{
 //       console.log(doc.data())//each time we get some data we push it to the data array
    data.push(doc.data());
    });

update(data);    
 //increasing the value every 3sec for 1st index element   
d3.interval(()=>{
    data[0].orders +=50;
    //data.pop- to remove last element from array evry 3 sec
   // update(data);
},3000)    
  
  
});
var data=[];//event listener for getting updates from firestore reg the changes in console
db.collection('dishes').onSnapshot(res=>{
    res.docChanges().forEach(change=>{
        console.log(change.doc.data());
    const doc={...change.doc.data(),id:change.doc.id};
    
    switch (change.type){
        case 'added':
            data.push(doc);
            break;
        case 'modified':
            const index=data.findIndex(item=>item.id==doc.id);
            data[index]=doc;
            break;
        case 'removed':  
            data=data.filter(item=>item.id!==doc.id);
            break;    
    }
    });
    update(data);
})     
/* //Tweens transition
const widthTween=(d)=>{
    //define interpolation
    //d3.interpolation returns a function which we call 'i'
  let i =d3.interpolate(0,x.bandwidth());
  
  //return a function which takes in a time ticker 't'
  return function(t){
      //return the value from passing the ticker into the interpolation
      return i(t);
  }
}
 */