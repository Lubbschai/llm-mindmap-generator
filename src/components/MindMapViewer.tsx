import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { MindMapData, MindMapNode, MindMapTheme } from '../types/mindmap';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MindMapViewerProps {
  data: MindMapData | null;
  theme: MindMapTheme;
  selectedNodes: string[];
  searchResults: string[];
  onNodeClick: (nodeId: string, multiSelect?: boolean) => void;
  onNodeDoubleClick: (nodeId: string) => void;
}

export const MindMapViewer: React.FC<MindMapViewerProps> = ({
  data,
  theme,
  selectedNodes,
  searchResults,
  onNodeClick,
  onNodeDoubleClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState(d3.zoomIdentity);

  useEffect(() => {
    if (!data || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Clear previous content
    svg.selectAll('*').remove();

    // Set up zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        setTransform(event.transform);
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);

    // Create main group
    const g = svg.append('g');

    // Apply current transform
    g.attr('transform', transform.toString());

    // Create links
    const links = data.nodes
      .filter(node => node.parentId)
      .map(node => {
        const parent = data.nodes.find(n => n.id === node.parentId);
        return parent ? { source: parent, target: node } : null;
      })
      .filter(Boolean) as Array<{ source: MindMapNode; target: MindMapNode }>;

    // Draw links
    g.selectAll('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => d.source.x || 0)
      .attr('y1', d => d.source.y || 0)
      .attr('x2', d => d.target.x || 0)
      .attr('y2', d => d.target.y || 0)
      .attr('stroke', theme.colors.link)
      .attr('stroke-width', 2)
      .attr('opacity', 0.6);

    // Create node groups
    const nodeGroups = g.selectAll('.node-group')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group')
      .attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`)
      .style('cursor', 'pointer');

    // Add node circles
    nodeGroups
      .append('circle')
      .attr('class', 'node-circle')
      .attr('r', d => (d.size || 10) + 5)
      .attr('fill', d => {
        if (selectedNodes.includes(d.id)) return theme.colors.node[0];
        if (searchResults.includes(d.id)) return '#FFB800';
        return d.color || theme.colors.node[d.level % theme.colors.node.length];
      })
      .attr('stroke', d => selectedNodes.includes(d.id) ? '#1F2937' : 'none')
      .attr('stroke-width', 2)
      .attr('opacity', d => d.collapsed ? 0.5 : 1);

    // Add node text
    nodeGroups
      .append('text')
      .attr('class', 'node-text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('font-family', theme.fonts.family)
      .style('font-size', d => `${d.size || 12}px`)
      .style('fill', theme.colors.text)
      .style('font-weight', d => d.level === 0 ? 'bold' : 'normal')
      .style('pointer-events', 'none')
      .text(d => {
        const maxLength = Math.max(8, 20 - d.level * 2);
        return d.content.length > maxLength 
          ? d.content.substring(0, maxLength) + '...'
          : d.content;
      });

    // Add collapse indicator for nodes with children
    nodeGroups
      .filter(d => d.children.length > 0)
      .append('circle')
      .attr('class', 'collapse-indicator')
      .attr('r', 8)
      .attr('cx', d => (d.size || 10) + 15)
      .attr('cy', 0)
      .attr('fill', '#6B7280')
      .attr('stroke', '#FFFFFF')
      .attr('stroke-width', 2);

    nodeGroups
      .filter(d => d.children.length > 0)
      .append('text')
      .attr('class', 'collapse-text')
      .attr('x', d => (d.size || 10) + 15)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('font-size', '10px')
      .style('fill', '#FFFFFF')
      .style('font-weight', 'bold')
      .style('pointer-events', 'none')
      .text(d => d.collapsed ? '+' : '−');

    // Add event listeners
    nodeGroups
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d.id, event.ctrlKey || event.metaKey);
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation();
        onNodeDoubleClick(d.id);
      });

    // Add title tooltips
    nodeGroups
      .append('title')
      .text(d => d.content);

    // Center the view on first load
    if (data.nodes.length > 0) {
      const bounds = g.node()?.getBBox();
      if (bounds) {
        const scale = Math.min(width / bounds.width, height / bounds.height) * 0.8;
        const translateX = width / 2 - bounds.x * scale - bounds.width * scale / 2;
        const translateY = height / 2 - bounds.y * scale - bounds.height * scale / 2;
        
        const newTransform = d3.zoomIdentity
          .translate(translateX, translateY)
          .scale(scale);
        
        svg.transition()
          .duration(750)
          .call(zoom.transform, newTransform);
      }
    }

  }, [data, theme, selectedNodes, searchResults, transform]);

  const handleZoomIn = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy,
        1.5
      );
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy,
        1 / 1.5
      );
    }
  };

  const handleResetView = () => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);
      svg.transition().call(
        d3.zoom<SVGSVGElement, unknown>().transform,
        d3.zoomIdentity
      );
    }
  };

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-96 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">还没有思维导图</p>
          <p className="text-sm mt-2">请先输入问题并生成回答</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md relative" style={{ height: '600px' }}>
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-white shadow-md rounded-md hover:bg-gray-50 transition-colors"
          title="放大"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-white shadow-md rounded-md hover:bg-gray-50 transition-colors"
          title="缩小"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={handleResetView}
          className="p-2 bg-white shadow-md rounded-md hover:bg-gray-50 transition-colors"
          title="重置视图"
        >
          <RotateCcw size={20} />
        </button>
      </div>

      <div ref={containerRef} className="w-full h-full">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ background: theme.colors.background }}
        />
      </div>

      {selectedNodes.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white shadow-md rounded-md p-3">
          <p className="text-sm font-medium text-gray-700">
            已选择 {selectedNodes.length} 个节点
          </p>
        </div>
      )}
    </div>
  );
};