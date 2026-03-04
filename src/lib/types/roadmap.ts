export interface Roadmaps {
  id: number
  title: string
  description: string
  createdAt: string
}

export interface RoadmapNode {
  id: number
  title: string
  content: string
  orderNum: number
  isCompleted: boolean
}
export interface RoadmapDetail extends Roadmaps {
  nodes: RoadmapNode[]
}