<script lang="ts">
	import type { RoadmapDetail ,RoadmapNode} from "$lib/types/roadmap";
	import type { PageProps } from "./$types";
	import { resolve } from "$app/paths";
	import { onMount } from "svelte";

	let { params }: PageProps = $props();
	let roadmap: RoadmapDetail | undefined = $state();

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
      <a href={resolve("/")}>← 목록으로 돌아가기</a>
      <h1>{roadmap.title}</h1>
      <p class="text-[#666] text-size-[1.1rem]">{roadmap.description}</p>
      <p>생성일: {new Date(roadmap.createdAt).toLocaleString()}</p>

    </div>

		<hr />

    <section>
      <h3>학습 노드</h3>
      {#if roadmap.nodes && !!roadmap.nodes.length}
        <ul class="list-none p-0">
          {#each roadmap.nodes as node (node.id)}
            <li class="flex gap-4 p-4 border border-solid border-[#eee] rounded-[8px] mb-2 items-start {node.isCompleted ? 'bg-[#f0fff0] border-[#90ee90]' : ''}">
              <input class="mt-[0.3rem] transform-scale-[1.2]" type="checkbox" checked={node.isCompleted} onchange={() => handleToggle(node)} />
              <div>
                <strong class="block text-size[1rem]">{node.title}</strong>
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
</main>