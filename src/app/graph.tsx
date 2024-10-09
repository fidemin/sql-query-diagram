import React, { useEffect, useRef } from 'react';
import dagre from '@dagrejs/dagre';
import { GraphNode } from './types/graphNode';
import { table } from 'console';

const setArrowMarker = (svg: SVGSVGElement) => {
    // Define arrow marker for edges
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrow');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto-start-reverse');

    // Create the actual arrow (a small triangle)
    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    arrowPath.setAttribute('fill', 'white');
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
    svg.appendChild(defs);
}

interface GraphProps {
    graphNodes: GraphNode[];
}

const Graph: React.FC<GraphProps> = ({ graphNodes }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (graphNodes.length === 0) return;

        // Create a new directed graph
        const g = new dagre.graphlib.Graph();

        // Set an object for the graph label
        g.setGraph({});

        // Default to assigning a new object as a label for each edge.
        g.setDefaultEdgeLabel(() => ({}));

        const graphKeySet = new Set<string>();
        graphNodes.forEach((node) => {
            graphKeySet.add(node.key);
        });
        console.log("graphKeySet: ", graphKeySet);

        graphNodes.forEach((node) => {
            console.log("node: ", node);
            g.setNode(node.key, { label: node.key, width: 100, height: 50 });

            node.tables.forEach((table) => {
                if (graphKeySet.has(table)) {
                    g.setEdge(table, node.key);
                }
            });
        });

        dagre.layout(g);

        // Draw the graph in SVG
        const svg = svgRef.current;
        if (svg) {
            // Clear the current SVG
            while (svg.firstChild) {
                svg.removeChild(svg.firstChild);
            }

            setArrowMarker(svg);
            const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svg.appendChild(svgGroup);

            g.nodes().forEach((node) => {
                const n = g.node(node);
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', (n.x - n.width / 2).toString()); // Adjust to center the rectangle
                rect.setAttribute('y', (n.y - n.height / 2).toString());
                rect.setAttribute('width', n.width.toString());
                rect.setAttribute('height', n.height.toString());
                rect.setAttribute('stroke', 'white');
                rect.setAttribute('fill', 'lightblue');
                svgGroup.appendChild(rect);

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', (n.x - 5).toString());
                text.setAttribute('y', (n.y + 5).toString());
                text.setAttribute('text-anchor', 'middle');
                text.textContent = n.label ?? '';
                svgGroup.appendChild(text);
            });

            g.edges().forEach((edge) => {
                const e = g.edge(edge);

                // There are two lines for each edge
                for (let i = 0; i < e.points.length - 1; i++) {
                    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    line.setAttribute('x1', e.points[i].x.toString());
                    line.setAttribute('y1', e.points[i].y.toString());
                    line.setAttribute('x2', e.points[i + 1].x.toString());
                    line.setAttribute('y2', e.points[i + 1].y.toString());
                    line.setAttribute('stroke', 'white');
                    if (i === e.points.length - 2) {
                        line.setAttribute('marker-end', 'url(#arrow)');
                    }
                    svgGroup.appendChild(line);
                }

            });
        }
    }, [graphNodes]);

    return <svg ref={svgRef} width="500" height="400" />;
};

export default Graph;