var svg = d3.select("#typechart > #graph").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
  .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");

var immune = svg.append("g").selectAll(".immune"),
    weak = svg.append("g").selectAll(".weak");
    strong = svg.append("g").selectAll(".strong");
    node = svg.append("g").selectAll(".node"),

d3.json("types.json", function(error, classes) {
  var nodes = cluster.nodes(packageHierarchy(classes)),
      immunes = typeImmune(nodes),
      strengths = typeStrong(nodes),
      weaknesses = typeWeak(nodes);

  immune = immune
      .data(bundle(immunes))
    .enter().append("path")
      .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
      .attr("class", "immune")
      .attr("d", line);

  weak = weak
      .data(bundle(weaknesses))
    .enter().append("path")
      .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
      .attr("class", "weak")
      .attr("d", line);

  strong = strong
      .data(bundle(strengths))
    .enter().append("path")
      .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
      .attr("class", "strong")
      .attr("d", line)
      .attr("data-is-effective-against-self", function(d) { return (d[0] === d[d.length - 1]) });

  node = node
      .data(nodes.filter(function(n) { return !n.children; }))
    .enter().append("text")
      .attr("class", function(n) {
        return 'node ' + n.name.toLowerCase();
      })
      .attr("dx", function(d) { return d.x < 180 ? 8 : -8; })
      .attr("dy", ".31em")
      .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")" + (d.x < 180 ? "" : "rotate(180)"); })
      .style("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
      .text(function(d) { return d.key; })
      .on("mouseover", mouseovered)
      .on("mouseout", mouseouted);
});

function mouseovered(d) {
  node
      .each(function(n) { n.target = n.source = false; });

  immune
      .classed("does-not-affect", function(l) { if (l.target === d) return l.source.target = true; })
    .filter(function(l) { return l.target === d; })
      .each(function(d) { this.parentNode.appendChild(this); });

  weak
      .classed("not-very-effective-against", function(l) { if (l.target === d) return l.source.target = true; })
    .filter(function(l) { return l.target === d })
      .each(function() { this.parentNode.appendChild(this); });

  strong
      .classed("super-effective-against", function(l) { if (l.target === d) { return l.source.target = true;} })
    .filter(function(l) { return l.target === d; })
      .each(function() { this.parentNode.appendChild(this); });


  node
      .classed("node--target", function(n) { return n.target; })
      .style('fill', function(l) {
        if(l.immunes.indexOf(d.name) != -1) {
          return 'rgba(250, 0, 235, 1)';
        }
        if(l.weaknesses.indexOf(d.name) != -1) {
          return 'rgba(0, 193, 248, 1)';
        }
        if(l.strengths.indexOf(d.name) != -1) {
          return 'rgba(255, 204, 0, 1)';
        }
        return null;
       });
}

function mouseouted(d) {
  immune
      .classed("does-not-affect", false);

  weak
      .classed("not-very-effective-against", false);

  strong
      .classed("super-effective-against", false);

  node
      .classed("node--target", false)
      .style('fill', null);

}

d3.select(self.frameElement).style("height", diameter + "px");

// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) {
  var map = {};

  function find(name, data) {
    var node = map[name], i;
    if (!node) {
      node = map[name] = data || {name: name, children: []};
      if (name.length) {
        node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
        node.parent.children.push(node);
        node.key = name.substring(i + 1);
      }
    }
    return node;
  }
  classes.forEach(function(d) {
    find(d.name, d);
  });

  return map[""];
}

//Make the immune links
function typeImmune(nodes) {
  var map = {},
      immunes = [];

  nodes.forEach(function(d) {
    map[d.name] = d;
  });

  nodes.forEach(function(d) {
    if (d.immunes) d.immunes.forEach(function(i) {
      immunes.push({source: map[d.name], target: map[i]});
    });
  });

  return immunes;
}
//Make the immune links
function typeWeak(nodes) {
  var map = {},
      weaknesses = [];

  nodes.forEach(function(d) {
    map[d.name] = d;
  });

  nodes.forEach(function(d) {
    if (d.weaknesses) d.weaknesses.forEach(function(i) {
      weaknesses.push({source: map[d.name], target: map[i]});
    });
  });

  return weaknesses;
}
function typeStrong(nodes) {
  var map = {},
      strengths = [];

  nodes.forEach(function(d) {
    map[d.name] = d;
  });

  nodes.forEach(function(d) {
    if (d.strengths) d.strengths.forEach(function(i) {
      strengths.push({source: map[d.name], target: map[i]});
    });
  });

  return strengths;
}