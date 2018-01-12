// client/app/app.component.ts

import { Component, OnInit, OnChanges, ViewEncapsulation, Input } from '@angular/core';
import * as d3 from 'd3';
import * as chroma from 'chroma-js';
import customChordSort from './custom.chord.sort';

@Component({
  selector: 'chord-diagram',
  templateUrl: './app/chord-diagram/chord-diagram.component.html',
  styleUrls: [
    './app/chord-diagram/chord-diagram.component.css'
  ],
  encapsulation: ViewEncapsulation.None
})

export class ChordComponent implements OnInit, OnChanges {

  @Input() private id: string;
  @Input() private data: Array<any>;
  @Input() private sort: boolean;
  // private chart: any;
  private width: number;
  private height: number;
  private layout_cache: any;
  

  constructor() {}
  
  ngOnInit() {
    this.createChart();
    if (this.data) {
      // this.updateChart();
    }
  }
  
  ngOnChanges() {
    // if (this.chart) {
      this.updateChart();
    // }
  }

//define the default chord layout parameters
//within a function that returns a new layout object;
//that way, you can create multiple chord layouts
//that are the same except for the data.
getDefaultLayout() {
  // console.log(this.sort);
    return customChordSort()
      .padAngle(0.025)
      .sortGroups(this.sort ? d3.descending : null)
      .sortSubgroups(d3.descending)
      .sortChords(d3.descending); //which chord should be shown on top when chords cross. Now the biggest chord is at the bottom
}  

  createChart() {
    ////////////////////////////////////////////////////////////
    //////////////////////// Set-Up ////////////////////////////
    ////////////////////////////////////////////////////////////

    const chartID = this.id;

    const chart = d3.select("#" + chartID).select("div");
    
    var margin = { left: 20, top: 20, right: 20, bottom: 20 };
    
      var width = chart.node().getBoundingClientRect().width - margin.left - margin.right;
      var height = chart.node().getBoundingClientRect().width - margin.top - margin.bottom;
      this.width = width;
      this.height = height;
      
    ////////////////////////////////////////////////////////////
    /////////// Create scale and layout functions //////////////
    ////////////////////////////////////////////////////////////

    // var chord = customChordSort()
    //   .padAngle(0.025)
    //   .sortGroups(groupSort ? d3.descending : null)
    //   .sortSubgroups(d3.descending)
    //   .sortChords(d3.descending); //which chord should be shown on top when chords cross. Now the biggest chord is at the bottom



    ////////////////////////////////////////////////////////////
    ////////////////////// Create SVG //////////////////////////
    ////////////////////////////////////////////////////////////

    var svg = chart.append("svg")
      .attr("preserveAspectRatio", "xMinYMin meet")
      .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom));

    var g = svg.append("g")
      .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")")
      // .datum(this.getDefaultLayout()(matrix))
      ;
      
      g.append("g")
      .attr("class", "groups");
      
      g.append("g")
        .attr("class", "ribbons");
      
    var tooltip = chart.append("div")
      .attr("id", "tooltip");
  }

  updateChart() {
    
    const chartID = this.id;

    const chart = d3.select("#" + chartID).select("div");
    
    const svg = chart.select("svg");
    
      const g = svg.select("g"),
      innerRadius = this.width * .32;
      
      const tooltip = chart.select("#tooltip");
      
      const outerRadius = innerRadius * 1.07;
      
        const arc = d3.arc()
      .innerRadius(innerRadius * 1.01)
      .outerRadius(outerRadius);

    const ribbon = d3.ribbon()
      .radius(innerRadius);
      
    const color = chroma.cubehelix()
      .start(270)
      .rotations(-5/9)
      .hue([.35, 1.1])
      .gamma(1)
      .lightness([0.35, 0.8])
      .scale()
      .correctLightness()
      .domain([0, 2 * Math.PI]);
      
      //     const color = chroma.cubehelix()
      // .start(293)
      // .rotations(-1)
      // .hue([1, 1])
      // .gamma(1)
      // .lightness([0.2, 0.8])
      // .scale()
      // .correctLightness()
      // .domain([0, 2 * Math.PI]);
      
    const opacityDefault = .8,
      transDur = 500;
      
    // const groupSort = parseInt(this.sort);
    const Names = this.data.slice(0, 1)[0];
    const keys = this.data.slice(1,2)[0];
    const matrix = this.data.slice(2);

    ////////////////////////////////////////////////////////////
    ////////////////// Draw outer Arcs /////////////////////////
    ////////////////////////////////////////////////////////////
    
    var layout = this.getDefaultLayout()(matrix);
    layout.groups.forEach(function(d) { d.key = keys[d.index]; });
    layout.forEach(function(d) { d.source.key = keys[d.source.index]; d.target.key = keys[d.target.index]; });
    // console.log(layout);

    var outerArcs = g.select("g.groups")
    .selectAll("g.group")
      .data(layout.groups, function(d) { return d.key; });
      
      outerArcs.exit()
        .transition()
            .duration(1500)
            .attr("opacity", 0)
            .remove(); //remove after transitions are complete
            
      var newArcs = outerArcs.enter().append("g")
        .attr("class", "group");
        
      newArcs
        .attr("id", function(d) { return chartID + "-Group" + d.key; })
        .append("path").attr("id", function(d) { return chartID + "-GroupPath" + d.key; })
      .style("fill", function(d) { return color((d.endAngle + d.startAngle) / 2); })
      .style("stroke", function(d) { return d3.rgb(color((d.endAngle + d.startAngle) / 2)).darker(); })
      .style("opacity", opacityDefault)
      .on("mouseover", mouseoverGroup)
      .on("mouseout", mouseoutChord)
      .on("mousemove", updateTooltipPosition)
      .attr("d", arc)
      // .each(function(d, i) {
      //   //Search pattern for everything between the start and the first capital L
      //   var firstArcSection = /(^.+?)L/;

      //   //Grab everything up to the first Line statement
      //   var newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
      //   //Replace all the comma's so that IE can handle it
      //   newArc = newArc.replace(/,/g, " ");

      //   //If the end angle lies beyond a quarter of a circle (90 degrees or pi/2) 
      //   //flip the end and start position
      //   if ((d.endAngle + d.startAngle) / 2 > 90 * Math.PI / 180 & (d.endAngle + d.startAngle) / 2 < 270 * Math.PI / 180) {
      //     var startLoc = /M(.*?)A/, //Everything between the first capital M and first capital A
      //       middleLoc = /A(.*?)0 0 1/, //Everything between the first capital A and 0 0 1
      //       endLoc = /0 0 1 (.*?)$/; //Everything between the first 0 0 1 and the end of the string (denoted by $)
      //     //Flip the direction of the arc by switching the start en end point (and sweep flag)
      //     //of those elements that are below the horizontal line
      //     var newStart = endLoc.exec(newArc)[1];
      //     var newEnd = startLoc.exec(newArc)[1];
      //     var middleSec = middleLoc.exec(newArc)[1];

      //     //Build up the new arc notation, set the sweep-flag to 0
      //     newArc = "M" + newStart + "A" + middleSec + "0 0 0 " + newEnd;
      //   } //if;

      //   //Create a new invisible arc that the text can flow along
      //   svg.append("path")
      //     .attr("class", "hiddenArcs")
      //     .attr("id", chartID + "-arc" + d.key)
      //     .attr("d", newArc)
      //     .style("fill", "none");
      // });
      
          outerArcs.select("path") 
        .transition()
            .duration(1500)
            // .attr("opacity", 0.5) //optional, just to observe the transition
            .attrTween("d", arcTween( this.layout_cache ))

    ////////////////////////////////////////////////////////////
    ////////////////// Append Names ////////////////////////////
    ////////////////////////////////////////////////////////////

    // //Append the label names on the outside
    // outerArcs.enter().selectAll("g.group").append("text")
    //   .attr("class", "titles")
    //   .attr("dy", function(d, i) { return ((d.endAngle + d.startAngle) / 2 > 90 * Math.PI / 180 & (d.endAngle + d.startAngle) / 2 < 270 * Math.PI / 180 ? innerRadius * .1 : -(innerRadius * .035)); })
    //   .append("textPath")
    //   .attr("startOffset", "50%")
    //   .style("text-anchor", "middle")
    //   .style("font-size", function(d) {return innerRadius*.1;})
    //   .attr("xlink:href", function(d, i) { return "#" + chartID + "-arc" + d.key; })
    //   .text(function(d, i) { return Names[i]; });
    
    newArcs.append("text")
    .attr("xlink:href", function(d) { return "#" + chartID + "-GroupPath" + d.key})
    .attr("class", "titles")
    .attr("dy", ".15em")
    .text(function(d, i) { return Names[i]; })
            .transition()
            .duration(1500)
            .attr("transform", function(d) {
                d.angle = (d.startAngle + d.endAngle) / 2;
                //store the midpoint angle in the data object
                
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                    " translate(" + (innerRadius + 26) + ")" + 
                    (d.angle > Math.PI ? " rotate(180)" : " rotate(0)"); 
                //include the rotate zero so that transforms can be interpolated
            })
            .attr("text-anchor", function (d) {
                return d.angle > Math.PI ? "end" : "begin";
            });
    
        //position group labels to match layout
    outerArcs.select("text")
        .transition()
            .duration(1500)
            .attr("transform", function(d) {
                d.angle = (d.startAngle + d.endAngle) / 2;
                //store the midpoint angle in the data object
                
                return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                    " translate(" + (innerRadius + 26) + ")" + 
                    (d.angle > Math.PI ? " rotate(180)" : " rotate(0)"); 
                //include the rotate zero so that transforms can be interpolated
            })
            .attr("text-anchor", function (d) {
                return d.angle > Math.PI ? "end" : "begin";
            });
    
    ////////////////////////////////////////////////////////////
    ////////////////// Draw inner chords ///////////////////////
    ////////////////////////////////////////////////////////////

    var innerChords = g.select("g.ribbons")
      .selectAll("path.chord")
      .data(layout, chordKey)
      .style("fill", function(d) { return chart.select("#" + chartID + "-Group" + d.target.key + " path").node().style.fill; })
      .style("stroke", function(d) { return chart.select("#" + chartID + "-Group" + d.target.key + " path").node().style.stroke; });
      
      
      innerChords.enter().append("path")
      .attr("d", ribbon)
      .attr("class", "chord")
      .style("fill", function(d) { return chart.select("#" + chartID + "-Group" + d.target.key + " path").node().style.fill; })
      .style("stroke", function(d) { return chart.select("#" + chartID + "-Group" + d.target.key + " path").node().style.stroke; })
      .style("opacity", opacityDefault)
      .on("mouseover", mouseoverChord)
      .on("mouseout", mouseoutChord)
      .on("mousemove", updateTooltipPosition);
      
      //handle exiting paths:
    innerChords.exit().transition()
        .duration(1500)
        .attr("opacity", 0)
        .remove();

    //update the path shape
    innerChords.transition()
        .duration(1500)
        // .attr("opacity", 0.5) //optional, just to observe the transition
        // .style("fill", function (d) {
        //     return neighborhoods[d.source.index].color;
        // })
        .attrTween("d", chordTween(this.layout_cache))
        .transition().duration(100).attr("opacity", 1) //reset opacity
    ;
      
this.layout_cache = layout;

    ////////////////////////////////////////////////////////////
    ////////////////// Extra Functions /////////////////////////
    ////////////////////////////////////////////////////////////

    //Returns an event handler for fading a given chord group.
    function mouseoverGroup(d, i) {
      const k = this.__data__.key;
      svg.selectAll("path.chord")
        .filter(function(d) { return d.source.key !== k && d.target.key !== k; })
        .transition().duration(transDur)
        .style("opacity", .1);

      tooltip
        .html(Names[keys.indexOf(this.__data__.key)] + " has liked " + this.__data__.outValue + " messages (" + d3.format(".1%")(this.__data__.outValue / this.__data__.total) + "),<br/>and has received " + this.__data__.value + " likes (" + d3.format(".1%")(this.__data__.value / this.__data__.total) + ").<br/>( " + d3.format(".2r")(this.__data__.outValue / this.__data__.value) + "/1 ratio )")
        .style("top", function() { return (d3.mouse(chart.node())[1] - tooltip.node().getBoundingClientRect().height - 20) + "px" })
        .style("left", function() { return Math.max(5, Math.min(chart.node().getBoundingClientRect().width - tooltip.node().getBoundingClientRect().width, (d3.mouse(chart.node())[0] - tooltip.node().getBoundingClientRect().width / 2))) + "px"; })
        .style("visibility", "visible")
        .transition()
        .style("opacity", 0)
        .transition().delay(1000).duration(1000)
        .style("opacity", .8)
        .transition().delay(4000).duration(5000)
        .style("opacity", 0);
    } //fade

    function updateTooltipPosition() {
      tooltip
        .style("top", function() { return (d3.mouse(chart.node())[1] - tooltip.node().getBoundingClientRect().height - 20) + "px" })
        .style("left", function() { return Math.max(5, Math.min(chart.node().getBoundingClientRect().width - tooltip.node().getBoundingClientRect().width, (d3.mouse(chart.node())[0] - tooltip.node().getBoundingClientRect().width / 2))) + "px"; })
        .style("visibility", "visible")
        // .transition()
        // .style("opacity", 0)
        .transition().delay(1000).duration(1000)
        .style("opacity", .8)
        .transition().delay(4000).duration(5000)
        .style("opacity", 0);
    }

    //Highlight hovered over chord
    function mouseoverChord(d, i) {
      //Decrease opacity to all
      svg.selectAll("path.chord")
        .transition().duration(transDur)
        .style("opacity", 0.1);
      //Show hovered over chord with full opacity
      d3.select(this)
        .transition().duration(transDur)
        .style("opacity", 1);

      tooltip
        .html(Names[keys.indexOf(this.__data__.target.key)] + " has liked " + this.__data__.source.value + " of " + Names[keys.indexOf(this.__data__.source.key)] + "'s messages,<br/>" + Names[keys.indexOf(this.__data__.source.key)] + " has liked " + this.__data__.target.value + " of " + Names[keys.indexOf(this.__data__.target.key)] + "'s messages.<br/>( " + d3.format(".2r")(this.__data__.source.value / this.__data__.target.value) + "/1 ratio )")
        .style("top", function() { return (d3.mouse(chart.node())[1] - tooltip.node().getBoundingClientRect().height - 20) + "px" })
        .style("left", function() { return Math.max(5, Math.min(chart.node().getBoundingClientRect().width - tooltip.node().getBoundingClientRect().width, (d3.mouse(chart.node())[0] - tooltip.node().getBoundingClientRect().width / 2))) + "px"; })
        .style("visibility", "visible")
        .transition()
        .style("opacity", 0)
        .transition().delay(1000).duration(1000)
        .style("opacity", .8)
        .transition().delay(4000).duration(5000)
        .style("opacity", 0);

    } //mouseoverChord

    //Bring all chords back to default opacity
    function mouseoutChord(d) {
      tooltip
        .transition()
        .style("opacity", 0)
        .style("visibility", "hidden")
      svg.selectAll("path.chord")
        .transition().duration(transDur)
        .style("opacity", opacityDefault);
    } //function mouseoutChord
  
  
  function arcTween(oldLayout) {
    //this function will be called once per update cycle
    
    //Create a key:value version of the old layout's groups array
    //so we can easily find the matching group 
    //even if the group index values don't match the array index
    //(because of sorting)
    var oldGroups = {};
    if (oldLayout) {
        oldLayout.groups.forEach( function(groupData) {
            oldGroups[ groupData.index ] = groupData;
        });
    }
    
    return function (d, i) {
        var tween;
        var old = oldGroups[d.index];
        if (old) { //there's a matching old group
            tween = d3.interpolate(old, d);
        }
        else {
            //create a zero-width arc object
            var emptyArc = {startAngle:d.startAngle,
                            endAngle:d.startAngle};
            tween = d3.interpolate(emptyArc, d);
        }
        
        return function (t) {
            return arc( tween(t) );
        };
    };
}

function chordKey(data) {
    return (data.source.key < data.target.key) ?
        data.source.key  + "-" + data.target.key:
        data.target.key  + "-" + data.source.key;
    
    //create a key that will represent the relationship
    //between these two groups *regardless*
    //of which group is called 'source' and which 'target'
}

function chordTween(oldLayout) {
    //this function will be called once per update cycle
    
    //Create a key:value version of the old layout's chords array
    //so we can easily find the matching chord 
    //(which may not have a matching index)
    
    var oldChords = {};
    
    if (oldLayout) {
        oldLayout.forEach( function(chordData) {
            oldChords[ chordKey(chordData) ] = chordData;
        });
    }
    
    return function (d, i) {
        //this function will be called for each active chord
        
        var tween;
        var old = oldChords[ chordKey(d) ];
        if (old) {
            //old is not undefined, i.e.
            //there is a matching old chord value
            
            //check whether source and target have been switched:
            if (d.source.key != old.source.key ){
                //swap source and target to match the new data
                old = {
                    source: old.target,
                    target: old.source
                };
            }
            
            tween = d3.interpolate(old, d);
        }
        else {
            //create a zero-width chord object
            if (oldLayout) {
                var oldGroups = oldLayout.groups.filter(function(group) {
                        return ( (group.key == d.source.key) ||
                                 (group.key == d.target.key) )
                    });
                old = {source:oldGroups[0],
                           target:oldGroups[1] || oldGroups[0] };
                    //the OR in target is in case source and target are equal
                    //in the data, in which case only one group will pass the
                    //filter function
                
                if (d.source.key != old.source.key ){
                    //swap source and target to match the new data
                    old = {
                        source: old.target,
                        target: old.source
                    };
                }
            }
            else old = d;
                
            var emptyChord = {
                source: { startAngle: old.source.startAngle,
                         endAngle: old.source.startAngle},
                target: { startAngle: old.target.startAngle,
                         endAngle: old.target.startAngle}
            };
            tween = d3.interpolate( emptyChord, d );
        }

        return function (t) {
            //this function calculates the intermediary shapes
            return ribbon(tween(t));
        };
    };
}

}
  
}
