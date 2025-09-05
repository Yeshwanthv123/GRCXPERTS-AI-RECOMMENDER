from typing import List, Tuple
import numpy as np

from sentence_transformers import SentenceTransformer
import faiss

class DedupeEngine:
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2", threshold: float = 0.92):
        self.model = SentenceTransformer(model_name)
        self.threshold = threshold

    def _emb(self, texts: List[str]) -> np.ndarray:
        return self.model.encode(texts, normalize_embeddings=True)

    def dedupe(self, keys: List[str]) -> Tuple[List[int], List[tuple]]:
        """Return indices to KEEP and a list of (i,j,sim) removed as duplicates."""
        if not keys:
            return [], []
        X = self._emb(keys)
        dim = X.shape[1]
        index = faiss.IndexFlatIP(dim)
        index.add(X)
        sims, ids = index.search(X, 6)  # self + top5
        to_drop = set()
        pairs = []
        for i in range(len(keys)):
            for k in range(1, ids.shape[1]):  # skip k=0 (self)
                j = int(ids[i, k])
                if j <= i:
                    continue
                sim = float(sims[i, k])
                if sim >= self.threshold:
                    pairs.append((i, j, sim))
                    to_drop.add(j)
        keep = [i for i in range(len(keys)) if i not in to_drop]
        return keep, pairs
