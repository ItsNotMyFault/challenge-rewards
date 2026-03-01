<script setup lang="ts">
import type { Core, EventObject, Stylesheet } from 'cytoscape'
import challengeData from '~/data/challenges.json'

const { categoryColors, categoryIcons } = useChallengeHelpers()
const store = useChallengesStore()

const emit = defineEmits<{
  nodeClick: [node: { id: string; label: string; description: string; category: string }]
}>()

const cyContainer = ref<HTMLDivElement>()
const tooltipVisible = ref(false)
const tooltipX = ref(0)
const tooltipY = ref(0)
const tooltipLabel = ref('')
const tooltipDescription = ref('')

let cy: Core | null = null

onMounted(async () => {
  const cytoscape = (await import('cytoscape')).default
  await nextTick()

  if (!cyContainer.value) return

  cy = cytoscape({
    container: cyContainer.value,
    elements: buildElements(),
    style: getStyles(),
    layout: { name: 'preset' },
    minZoom: 0.3,
    maxZoom: 3,
    wheelSensitivity: 0.3,
    autoungrabify: true,
    autounselectify: true,
  })

  cy.fit(undefined, 50)
  cy.center()

  cy.on('mouseover', 'node', onNodeMouseOver)
  cy.on('mouseout', 'node', onNodeMouseOut)
  cy.on('mousemove', 'node', onNodeMouseMove)

  cy.on('tap', 'node', (event: EventObject) => {
    const node = event.target
    emit('nodeClick', {
      id: node.data('id'),
      label: node.data('label'),
      description: node.data('description'),
      category: node.data('category'),
    })
  })

  applyCompletedClasses()
})

onUnmounted(() => {
  cy?.destroy()
  cy = null
})

watch(() => store.completedSkillTreeIds, () => {
  applyCompletedClasses()
}, { deep: true })

function applyCompletedClasses() {
  if (!cy) return
  cy.nodes().forEach((node) => {
    if (store.isSkillTreeChallengeCompleted(node.data('id'))) {
      node.addClass('completed')
    }
    else {
      node.removeClass('completed')
    }
  })
}

defineExpose({
  resize() {
    if (cy) {
      cy.resize()
      cy.fit(undefined, 50)
    }
  },
})

function buildElements() {
  const nodes = challengeData.nodes.map(n => ({
    data: {
      id: n.id,
      label: n.label,
      description: n.description,
      category: n.category,
    },
    position: { x: n.position.x, y: n.position.y },
  }))

  const edges = challengeData.edges.map(e => ({
    data: {
      source: e.source,
      target: e.target,
    },
  }))

  return [...nodes, ...edges]
}

function onNodeMouseOver(event: EventObject) {
  const node = event.target
  tooltipLabel.value = node.data('label')
  tooltipDescription.value = node.data('description')
  tooltipVisible.value = true
  updateTooltipPosition(event)
}

function onNodeMouseMove(event: EventObject) {
  updateTooltipPosition(event)
}

function onNodeMouseOut() {
  tooltipVisible.value = false
}

function updateTooltipPosition(event: EventObject) {
  const pos = event.renderedPosition
  if (pos && cyContainer.value) {
    const rect = cyContainer.value.getBoundingClientRect()
    tooltipX.value = pos.x + rect.left
    tooltipY.value = pos.y + rect.top - 10
  }
}

function getStyles(): Stylesheet[] {
  return [
    {
      selector: 'node',
      style: {
        'shape': 'round-rectangle',
        'label': 'data(label)',
        'width': 56,
        'height': 56,
        'background-color': '#ffffff',
        'background-opacity': 1,
        'border-width': 2,
        'border-color': '#cbd5e1',
        'color': '#1e293b',
        'font-size': '10px',
        'text-valign': 'bottom',
        'text-margin-y': 8,
        'text-outline-color': '#f8fafc',
        'text-outline-width': 2,
      },
    },
    ...Object.entries(categoryColors).map(([cat, color]) => ({
      selector: `node[category = "${cat}"]`,
      style: {
        'border-color': color,
        'border-width': 3,
        'background-image': categoryIcons[cat],
        'background-fit': 'none',
        'background-width': '55%',
        'background-height': '55%',
        'background-clip': 'none',
        'background-image-smoothing': 'yes',
        'min-zoomed-font-size': 0,
      },
    })),
    ...Object.entries(categoryColors).map(([cat, color]) => ({
      selector: `node.completed[category = "${cat}"]`,
      style: {
        'background-color': color,
        'background-opacity': 0.3,
        'border-color': color,
        'border-width': 5,
        'border-opacity': 1,
      },
    })),
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#94a3b8',
        'curve-style': 'bezier',
        'target-arrow-shape': 'none',
        'opacity': 0.6,
      },
    },
  ] as Stylesheet[]
}
</script>

<template>
  <div ref="cyContainer" class="size-full" />
  <div
    v-show="tooltipVisible"
    class="pointer-events-none fixed z-50 max-w-[250px] -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur-sm"
    :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }"
  >
    <div class="text-sm font-semibold text-slate-900">
      {{ tooltipLabel }}
    </div>
    <div class="mt-1 text-xs leading-relaxed text-slate-500">
      {{ tooltipDescription }}
    </div>
  </div>
</template>
