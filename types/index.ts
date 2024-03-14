export interface ISection {
  title: string
  id: string
  items: Array<{
    flags: string[]
    text: string
    id: string
    count: number
    links: Array<{
      text: string
      src: string
    }>
  }>
}
