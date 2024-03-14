<script setup lang="ts">
import type { ISection } from '~/types'

const { data } = await useFetch<{
  ukrainianLoses: ISection[]
  russianLoses: ISection[]
}>('/api/get-data')

const trimArrayTo10 = (arr: ISection[]) => {
  return arr.map((section) => {
    // if (section.items.length > 10) {
    //   section.items = section.items.slice(0, 10)
    // }
    return section
  })
}

const losses = computed(() => {
  if (!data.value) return null

  return [
    {
      name: 'Ukrainian losses',
      data: trimArrayTo10(data.value.ukrainianLoses),
    },
    {
      name: 'Russian losses',
      data: trimArrayTo10(data.value.russianLoses),
    },
  ]
})
</script>

<template>
  <div>
    <div class="grid grid-cols-2 gap-8">
      <div
        v-for="loseSide in losses"
        :key="loseSide.name"
        class="flex flex-col gap-4"
      >
        <h2
          class="sticky top-[74px] bg-white px-3 py-2 z-2000 rounded-md shadow-md border border-gray-200"
        >
          {{ loseSide.name }}
        </h2>

        <VCard
          v-for="section in loseSide.data"
          :key="section.id"
          elevation="4"
          class="max-h-120 h-120 overflow-y-auto"
        >
          <VCardText>
            <h3>{{ section.title }}</h3>

            <VList>
              <VListItem v-for="item in section.items" :key="item.id">
                <template #prepend>
                  <div class="pr-2 flex gap-1">
                    <template v-for="flag in item.flags" :key="flag">
                      <img :src="flag">
                    </template>
                  </div>
                </template>

                <VListItemTitle>
                  <VChip density="compact" variant="tonal">
                    {{ item.count }}
                  </VChip>

                  {{ item.text }}

                  <!-- v-for for item.links ([{src,text}]) -->

                  <template v-for="link in item.links" :key="link.src">
                    <a :href="link.src" class="text-emerald-400">{{ link.text }}</a>
                  </template>
                </VListItemTitle>
              </VListItem>
            <!--  -->
            </VList>
          </VCardText>
        </VCard>
      </div>
    </div>
  </div>
</template>

<style>
body {
  @apply m-2 mx-4
}

h3 { @apply font-sans text-sm font-medium }

b {
  @apply text-emerald-400 font-sans text-sm
}
</style>
