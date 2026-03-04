<script lang="ts">
	import type { Roadmaps } from "$lib/types/roadmap";
	import { resolve } from "$app/paths";
	import { onMount } from "svelte";

  let roadmaps: Roadmaps[] = $state([]);
  let newTitle = $state('')
  let newDescription = $state('')

  async function saveRoadmap() {
    const response = await fetch('http://localhost:8080/api/roadmaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, description: newDescription })
    })

    if (response.ok) {
      console.log('등록 성공')
      location.reload();
    }
  }


  onMount(async () => {
    const response = await fetch('http://localhost:8080/api/roadmaps');
    if (response.ok) {
      roadmaps = await response.json();
    }
    else {
      console.error('데이터를 불러오는데 실패했습니다.');
      
    }
  })
</script>

<main>
  <h1>나의 학습 로드맵</h1>

  {#if !roadmaps.length}
    <p>등록된 로드맵이 없습니다. 첫 로드맵을 만들어보세요!</p>
  {:else}
    <ul>
      {#each roadmaps as roadmap (roadmap.id)}
        <li class="border border-solid border-[#ddd] rounded-[8px] p-4 mb-4 list-none">
          <a href={resolve('/roadmap/[id]', { id: String(roadmap.id) })}>
            <h3 class="mt-0 text-[#ff3e00]">{roadmap.title}</h3>
          </a>
          <p>{roadmap.description}</p>
          <small>생성일: {new Date(roadmap.createdAt).toLocaleDateString()}</small>
        </li>
      {/each}
    </ul>
  {/if}

  <hr />
  <section>
    <h2>새 로드맵 등록</h2>
    <input bind:value={newTitle} placeholder="제목을 입력하세요" />
    <textarea bind:value={newDescription} placeholder="설명을 입력하세요"></textarea>
    <button onclick={saveRoadmap}>등록하기</button>
  </section>
</main>

<style>

</style>