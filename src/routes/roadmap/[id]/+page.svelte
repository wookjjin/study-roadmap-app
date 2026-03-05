<script lang="ts">
	import type { RoadmapDetail ,RoadmapNode} from '$lib/types/roadmap';
	import type { PageProps } from './$types';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { flip } from 'svelte/animate';
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';

	let { params }: PageProps = $props();
	let roadmap: RoadmapDetail | undefined = $state();
  let nodeTitle = $state();
  let nodeContent = $state();
  let draggingNodeIndex: number | null = $state(null);
  let hoverNodeIndex: number | null = $state(null);

  const deleteRoadmap = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/roadmaps/${roadmap?.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        goto(resolve('/'));
      }
      else {
        throw new Error('삭제 실패');
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleDeleteRoadmap = () => {
    if (!confirm('이 로드맵과 모든 학습 노드가 삭제됩니다. 정말 삭제하시겠어요?')) {
      return;
    };

    deleteRoadmap();
  }

  const addNode = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/roadmaps/${params.id}/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ title: nodeTitle, content: nodeContent})
      });

      if (response.ok) {
        const newNode = await response.json();
        roadmap?.nodes.push(newNode);
      }
    } catch (error) {
      console.error(error);
    } finally {
      nodeTitle = ''
      nodeContent = ''
    }
  }

  const deleteNode = async (nodeId: number) => {
    if (!roadmap) return;
    const originalNodes = [...roadmap.nodes];

    roadmap.nodes = roadmap.nodes.filter(n => n.id !== nodeId);
    try {
      const response = await fetch(`http://localhost:8080/api/nodes/${nodeId}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error('삭제 실패');
      }
    } catch (error) {
      roadmap.nodes = originalNodes;
      console.error(error);
    }
  }

  const handleDeleteNode = (nodeId: number) => {
    if (!confirm('선택한 학습 노드를 정말 삭제하시겠어요?')) {
      return;
    }
    deleteNode(nodeId)
  }

  const handleToggle = async (node: RoadmapNode) => {
    const previousStatus = !node.isCompleted;
    try {
      node.isCompleted = !node.isCompleted

      const response = await fetch(`http://localhost:8080/api/nodes/${node.id}/toggle`, { method: 'PATCH' })

      if (!response.ok) {
            throw new Error('서버 업데이트 실패');
        }
    } catch (error) {
      node.isCompleted = previousStatus;
      console.error(error)
    }
  }

  const updateNodeOrder = async () => {
    const nodeList = roadmap?.nodes.map(n => n.id)

    try {
      const response = await fetch(`http://localhost:8080/api/roadmaps/${roadmap?.id}/nodes/reorder`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({nodeList}) // [10, 8, 11, 9] 형태
        });

        if (!response.ok) throw new Error('순서 저장 실패');
    } catch (error) {
      console.error(error);
      
    }
  }

  const onDrageStart = (index: number) => {
    draggingNodeIndex = index
  }

  const onDragOver = (e: Event, index: number) => {
    e.preventDefault()
    hoverNodeIndex = index
  }

  const onDrop = (index: number) => {
    const from = draggingNodeIndex
    const to = index
    
    if (!roadmap?.nodes || from === null) return;
    const newNodes = [...roadmap.nodes];
    const [movedItem] = newNodes.splice(from, 1);
    newNodes.splice(to, 0, movedItem);

    roadmap.nodes = newNodes;

    draggingNodeIndex = null;
    hoverNodeIndex = null;

    updateNodeOrder()
  }
	onMount(async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/roadmaps/${params.id}`);
      if (response.ok) {
        roadmap = await response.json();
      }
    } catch (error) {
      console.error(error)
    }
	});
</script>

<main>
  {#if roadmap}
    <div class="mb-8">
      <a href={resolve('/')}>← 목록으로 돌아가기</a>
      <div class="flex gap-4">
        <h1>{roadmap.title}</h1>
        <button class="text-red-400 cursor-pointer" onclick={handleDeleteRoadmap}>로드맵 삭제</button>
      </div>
      <p class="text-[#666] text-size-[1.1rem]">{roadmap.description}</p>
      <p>생성일: {new Date(roadmap.createdAt).toLocaleString()}</p>

    </div>

		<hr />

    <section class="my-8">
      <h3>학습 노드</h3>
      {#if roadmap.nodes && !!roadmap.nodes.length}
        <ul class="list-none p-0">
          {#each roadmap.nodes as node, i (node.id)}
            <li class="flex gap-4 p-4 border border-solid border-[#eee] rounded-[8px] mb-2 items-start 
              {node.isCompleted ? 'bg-[#f0fff0] border-[#90ee90]' : ''}
              {draggingNodeIndex === i ? 'opacity-[0.4] border border-dashed border-[#4A90E2]' : ''}
              {hoverNodeIndex === i ? 'border-t-[3px] border-solid border-[#4A90E2] translate-y-[2px]':''}
            "
              animate:flip={{ duration: 300 }}
              transition:slide={{ duration: 300 }}
              draggable="true"
              ondragstart={() => onDrageStart(i)}
              ondragover={(e) => onDragOver(e, i)}
              ondragleave={() => hoverNodeIndex = null}
              ondrop={() => onDrop(i)}
            >
              <input class="mt-[0.3rem] transform-scale-[1.2]" type="checkbox" checked={node.isCompleted} onchange={() => handleToggle(node)} />
              <div>
                <div class="flex gap-4">
                  <strong class="block text-size[1rem]">⠿ {node.title}</strong>
                  <button onclick={() => handleDeleteNode(node.id)}>삭제</button>
                </div>
                <p class="mt-[0.2rem] mx-0 mb-0 text-size-[0.9rem] text-[#555]">{node.content || '상세 설명이 없습니다.'}</p>
              </div>
            </li>
          {/each}
        </ul>
        {:else}
          <p class="mt-2 text-size-2xl text-[#555]">등록된 노드가 없어요. 노드를 추가해 보세요!</p>
      {/if}
    </section>
	{/if}
  <section>
    <h3>학습 노드 추가</h3>
    <input bind:value={nodeTitle} placeholder="제목을 입력하세요" />
    <textarea bind:value={nodeContent} placeholder="내용이나 메모를 입력하세요"></textarea>
    <button onclick={addNode}>등록하기</button>
  </section>
</main>