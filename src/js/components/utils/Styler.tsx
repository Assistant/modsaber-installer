import { Component } from 'react'

interface IProps {
  content: string
  disabled?: boolean
  key?: string
}

class Styler extends Component<IProps> {
  protected styleTag: HTMLStyleElement | null = null

  public componentDidMount() {
    const head = document.head || document.getElementsByTagName('head')[0]

    this.styleTag = document.createElement('style')
    this.styleTag.type = 'text/css'
    this.styleTag.dataset.styler = 'true' || this.props.key
    this.styleTag.appendChild(document.createTextNode(this.props.content))

    head.appendChild(this.styleTag)
  }

  public componentDidUpdate(prevProps: IProps): void {
    if (
      prevProps.content === this.props.content &&
      prevProps.disabled === this.props.disabled &&
      prevProps.key === this.props.key
    ) {
      return undefined
    }

    if (this.styleTag) {
      this.styleTag.childNodes.forEach(child => child.remove())

      if (!this.props.disabled) {
        this.styleTag.appendChild(document.createTextNode(this.props.content))
      }

      if (prevProps.key !== this.props.key) {
        this.styleTag.dataset.styler = 'true' || this.props.key
      }
    }
  }

  public componentWillUnmount() {
    if (this.styleTag) this.styleTag.remove()
  }

  public render() {
    return null
  }
}

export default Styler
