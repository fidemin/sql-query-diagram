import React, { useEffect, useRef, useState } from 'react';
import dagre from '@dagrejs/dagre';
import { GraphNode } from './types/graphNode';

const setArrowMarker = (svg: SVGSVGElement) => {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrow');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto-start-reverse');

    const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    arrowPath.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    arrowPath.setAttribute('fill', 'white');
    marker.appendChild(arrowPath);
    defs.appendChild(marker);
    svg.appendChild(defs);
};

interface GraphProps {
    graphNodes: GraphNode[];
}

const Graph: React.FC<GraphProps> = ({ graphNodes }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    const [dragging, setDragging] = useState(false);
    const [transform, setTransform] = useState({ x: 0, y: 0 });
    const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (graphNodes.length === 0) return;

        const g = new dagre.graphlib.Graph();
        g.setGraph({});
        g.setDefaultEdgeLabel(() => ({}));

        const graphKeySet = new Set<string>();
        graphNodes.forEach((node) => graphKeySet.add(node.key));

        graphNodes.forEach((node) => {
            g.setNode(node.key, { label: node.key, sql: node.sql, width: 300, height: 150 });
            node.tables.forEach((table) => {
                if (graphKeySet.has(table)) g.setEdge(table, node.key);
            });
        });

        dagre.layout(g);

        const svg = svgRef.current;
        if (svg) {
            while (svg.firstChild) {
                svg.removeChild(svg.firstChild);
            }

            setArrowMarker(svg);
            const svgGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            svg.appendChild(svgGroup);

            svgGroup.setAttribute('transform', `translate(${transform.x}, ${transform.y})`);

            g.nodes().forEach((node) => {
                const n = g.node(node);
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', (n.x - n.width / 2).toString());
                rect.setAttribute('y', (n.y - n.height / 2).toString());
                rect.setAttribute('width', n.width.toString());
                rect.setAttribute('height', n.height.toString());
                rect.setAttribute('stroke', 'white');
                rect.setAttribute('fill', 'lightblue');
                svgGroup.appendChild(rect);

                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', n.x.toString());
                text.setAttribute('y', (n.y - 20).toString());
                text.setAttribute('text-anchor', 'middle');
                text.textContent = n.label ?? '';
                svgGroup.appendChild(text);

                const sqlText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                sqlText.setAttribute('x', n.x.toString());
                sqlText.setAttribute('y', (n.y + 20).toString());
                sqlText.setAttribute('text-anchor', 'middle');
                sqlText.setAttribute('fill', 'gray');
                sqlText.textContent = n.sql ?? '';
                svgGroup.appendChild(sqlText);
            });

            g.edges().forEach((edge) => {
                const e = g.edge(edge);
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
    }, [graphNodes, transform]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setDragging(true);
        setStartPoint({ x: e.clientX, y: e.clientY });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return;
        const dx = e.clientX - startPoint.x;
        const dy = e.clientY - startPoint.y;
        setTransform((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
        setStartPoint({ x: e.clientX, y: e.clientY });
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    return (
        <svg
            ref={svgRef}
            width="1500"
            height="1000"
            // viewBox="0 0 2000 1500"
            preserveAspectRatio="xMidYMid meet"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        />
    );
};

export default Graph;