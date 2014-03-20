var svg = d3.select("#typechart > #graph").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");

var immune = svg.append("g").selectAll(".immune"),
    weak = svg.append("g").selectAll(".weak"),
    strong = svg.append("g").selectAll(".strong"),
    node = svg.append("g").selectAll(".node");

d3.json("types.json", function(error, classes) {
    window.nodes = cluster.nodes(packageHierarchy(classes));
    window.immunes = typeImmune(nodes);
    window.strengths = typeStrong(nodes);
    window.weaknesses = typeWeak(nodes);

    window.immune = immune
        .data(bundle(window.immunes))
        .enter().append("path")
        .each(function(d) {
            d.source = d[0], d.target = d[d.length - 1];
        })
        .attr("class", "immune")
        .attr("d", line);

    window.weak = weak
        .data(bundle(window.weaknesses))
        .enter().append("path")
        .each(function(d) {
            d.source = d[0], d.target = d[d.length - 1];
        })
        .attr("class", "weak")
        .attr("d", line);

    window.strong = strong
        .data(bundle(window.strengths))
        .enter().append("path")
        .each(function(d) {
            d.source = d[0], d.target = d[d.length - 1];
        })
        .attr("class", "strong")
        .attr("d", line)
        .attr("data-is-effective-against-self", function(d) {
            return (d[0] === d[d.length - 1]);
        });

    window.node = node
        .data(window.nodes.filter(function(n) {
            return !n.children;
        }))
        .enter().append("text")
        .attr("class", function(n) {
            return 'node ' + n.name.toLowerCase();
        })
        .attr("dx", function(d) {
            return d.x < 180 ? 8 : -8;
        })
        .attr("dy", ".31em")
        .attr("transform", function(d) {
            return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")" + (d.x < 180 ? "" : "rotate(180)");
        })
        .style("text-anchor", function(d) {
            return d.x < 180 ? "start" : "end";
        })
        .text(function(d) {
            return d.key;
        })
        .on("click", activate);
});

function reset() {
    window.immune
        .classed("is-immune", false);

    window.weak
        .classed("resists-against", false);

    window.strong
        .classed("is-weak-against", false);

    window.node
        .classed("node--target", false)
        .classed("immune-node", false)
        .classed("weaknesses-node", false)
        .classed("strengths-node", false)
        .classed("double-weaknesses-node", false)
        .classed("double-strengths-node", false)
        .classed("node--active", false);

    window.dualType = {
        size: function() {
            var size = 0,
                key;
            for (key in this) {
                if (this.hasOwnProperty(key)) size++;
            }
            return size;
        }
    };
    window.dualTypeIdx = [];

    return false;
}

function activate(d) {


    if (window.dualType.size() > 2) {
        window.dualType = {
            size: function() {
                var size = 0,
                    key;
                for (key in this) {
                    if (this.hasOwnProperty(key)) size++;
                }
                return size;
            }
        };
        window.dualTypeIdx = [];
        window.node.each(function(n) {
            n.target = n.source = false;
        }).attr("class", function(n) {
            return 'node ' + n.name.toLowerCase();
        });
    }

    if (window.dualType[d.name] !== undefined) {
        delete window.dualType[d.name];
    }

    window.dualType[d.name] = d;
    window.dualTypeIdx.push(d);

    var idx = 1;
    document.getElementById("type1").innerHTML = "";
    document.getElementById("type2").innerHTML = "";
    for (var type in window.dualType) {
        if (type !== "size") {
            document.getElementById("type" + idx).innerHTML = type;
            idx++;
        }
    }

    window.node
        .each(function(n) {
            n.target = n.source = false;
        });



    window.immune
        .classed("is-immune", function(l) {
            return window.colorPath(window.dualType, l, 'weak');
        })
        .filter(function(l) {
            return l.target === d;
        })
        .each(function(d) {
            this.parentNode.appendChild(this);
        });

    window.weak
        .classed("resists-against", function(l) {
            return window.colorPath(window.dualType, l, 'weak');
        })
        .filter(function(l) {
            return l.target === d;
        })
        .each(function() {
            this.parentNode.appendChild(this);
        });

    window.strong
        .classed("is-weak-against", function(l) {
            return window.colorPath(window.dualType, l, 'weak');
        })
        .filter(function(l) {
            return l.target === d;
        })
        .each(function() {
            this.parentNode.appendChild(this);
        });


    window.node
        .classed("node--active", function(target) {
            return (target === d) || this.classList.contains("node--active");
        })
        .classed("node--target", function(n) {
            return n.target;
        })
        .classed("immune-node", function(target, l) {
            return (this.classList.contains('immune-node') || target.immunes.indexOf(d.name) != -1);
        })
        .classed("weaknesses-node", function(target) {
            return (this.classList.contains('weaknesses-node') || target.weaknesses.indexOf(d.name) != -1);
        })
        .classed("strengths-node", function(target) {
            return (target.strengths.indexOf(d.name) != -1);
        })
        .classed("double-strengths-node", function(target) {
            return ( !! window.dualTypeIdx[0] && !! window.dualTypeIdx[1] && target.strengths.indexOf(window.dualTypeIdx[0].name) !== -1 && target.strengths.indexOf(window.dualTypeIdx[1].name) !== -1);
        })
        .classed("double-weaknesses-node", function(target) {
            return ( !! window.dualTypeIdx[0] && !! window.dualTypeIdx[1] && target.weaknesses.indexOf(window.dualTypeIdx[0].name) !== -1 && target.weaknesses.indexOf(window.dualTypeIdx[1].name) !== -1);
        });
}

d3.select(self.frameElement).style("height", diameter + "px");

// Lazily construct the package hierarchy from class names.
function packageHierarchy(classes) {
    var map = {};

    function find(name, data) {
        var node = map[name],
            i;
        if (!node) {
            node = map[name] = data || {
                name: name,
                children: []
            };
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
            immunes.push({
                source: map[d.name],
                target: map[i]
            });
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
            weaknesses.push({
                source: map[d.name],
                target: map[i]
            });
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
            strengths.push({
                source: map[d.name],
                target: map[i]
            });
        });
    });

    return strengths;
}
reset();