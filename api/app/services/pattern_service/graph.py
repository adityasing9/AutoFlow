import networkx as nx
from typing import List, Dict, Any, Tuple
from app.utils.logger import get_logger

logger = get_logger("workflow_graph")

class WorkflowGraphAnalyzer:
    """
    Academic DSA Component: Directed Graph Workflow Representation
    
    Data Structure: Directed Graph G = (V, E)
    Vertices (V): Event states (e.g., FILE_CREATED:PDF)
    Edges (E): Transitions between consecutive events in a sequence, with weight = transition count.
    
    Algorithms:
    - Directed Path Extraction: O(V + E)
    - Topological Sort / Dominant Chain Detection: O(V + E)
    - Transition Entropy / Sequence Consistency: O(E)
    """
    def __init__(self):
        self.graph = nx.DiGraph()

    def build_from_sequences(self, sequences: List[List[str]]):
        """Constructs a weighted directed graph from a collection of event sequences."""
        self.graph.clear()
        
        for seq in sequences:
            if not seq:
                continue
            for i in range(len(seq) - 1):
                u, v = seq[i], seq[i + 1]
                if self.graph.has_edge(u, v):
                    self.graph[u][v]["weight"] += 1
                else:
                    self.graph.add_edge(u, v, weight=1)

    def get_longest_frequent_path(self, min_weight: int = 1) -> List[str]:
        """
        Finds the primary linear workflow chain using greedy path traversal
        starting from the root nodes (in-degree == 0).
        """
        if not self.graph.nodes:
            return []
            
        # Find candidate starting nodes (sources or highest in-degree ratio)
        start_nodes = [n for n in self.graph.nodes if self.graph.in_degree(n) == 0]
        if not start_nodes:
            start_nodes = list(self.graph.nodes)
            
        best_path = []
        for start in start_nodes:
            current = start
            path = [current]
            visited = {current}
            
            while True:
                out_edges = self.graph.out_edges(current, data=True)
                valid_edges = [
                    (u, v, d) for u, v, d in out_edges
                    if v not in visited and d.get("weight", 0) >= min_weight
                ]
                if not valid_edges:
                    break
                    
                # Pick edge with highest weight
                best_edge = max(valid_edges, key=lambda x: x[2]["weight"])
                next_node = best_edge[1]
                visited.add(next_node)
                path.append(next_node)
                current = next_node
                
            if len(path) > len(best_path):
                best_path = path
                
        return best_path

    def to_json_graph(self) -> Dict[str, Any]:
        """Converts graph into visual node-link structure for frontend rendering."""
        nodes = [{"id": n, "label": n} for n in self.graph.nodes]
        links = [
            {"source": u, "target": v, "weight": d.get("weight", 1)}
            for u, v, d in self.graph.edges(data=True)
        ]
        return {"nodes": nodes, "links": links}
