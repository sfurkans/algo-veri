import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import SplashScreen from "./components/SplashScreen";
import Home from "./pages/Home";
import KidsPage from "./pages/KidsPage";
import BubbleSort from "./pages/sorting/BubbleSort";
import SelectionSort from "./pages/sorting/SelectionSort";
import InsertionSort from "./pages/sorting/InsertionSort";
import MergeSort from "./pages/sorting/MergeSort";
import QuickSort from "./pages/sorting/QuickSort";
import HeapSort from "./pages/sorting/HeapSort";
import LinearSearch from "./pages/searching/LinearSearch";
import BinarySearch from "./pages/searching/BinarySearch";
import Stack from "./pages/data-structures/Stack";
import Queue from "./pages/data-structures/Queue";
import LinkedList from "./pages/data-structures/LinkedList";
import BinaryTree from "./pages/data-structures/BinaryTree";
import HashTable from "./pages/data-structures/HashTable";
import Graf from "./pages/data-structures/Graph";
import BFS from "./pages/searching/BFS";
import DFS from "./pages/searching/DFS";
import Dijkstra from "./pages/searching/Dijkstra";
import BigOPage from "./pages/big-o/BigOPage";
import Comparison from "./pages/comparison/Comparison";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/basit" element={<KidsPage />} />
            <Route path="/sorting/bubble-sort" element={<BubbleSort />} />
            <Route path="/sorting/selection-sort" element={<SelectionSort />} />
            <Route path="/sorting/insertion-sort" element={<InsertionSort />} />
            <Route path="/sorting/merge-sort" element={<MergeSort />} />
            <Route path="/sorting/quick-sort" element={<QuickSort />} />
            <Route path="/sorting/heap-sort"  element={<HeapSort />} />
            <Route path="/searching/linear-search" element={<LinearSearch />} />
            <Route path="/searching/binary-search" element={<BinarySearch />} />
            <Route path="/data-structures/stack" element={<Stack />} />
            <Route path="/data-structures/queue" element={<Queue />} />
            <Route path="/data-structures/linked-list" element={<LinkedList />} />
            <Route path="/data-structures/binary-tree" element={<BinaryTree />} />
            <Route path="/data-structures/hash-table"  element={<HashTable />} />
            <Route path="/data-structures/graph"       element={<Graf />} />
            <Route path="/searching/bfs"              element={<BFS />} />
            <Route path="/searching/dfs"              element={<DFS />} />
            <Route path="/searching/dijkstra"         element={<Dijkstra />} />
            <Route path="/big-o" element={<BigOPage />} />
            <Route path="/karsilastir" element={<Comparison />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </>
  );
}
