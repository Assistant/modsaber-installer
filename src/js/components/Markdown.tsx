import React from 'react'
import Highlight from 'react-highlight'
import ReactMarkdown from 'react-markdown'

import 'highlight.js/styles/atom-one-light.css'
import ExtLink from './ExtLink'

interface IRendererProps {
  source: string
}

const MarkdownRenderer: React.FunctionComponent<IRendererProps> = ({
  source,
}) => (
  <ReactMarkdown
    source={source}
    renderers={{
      code: CodeBlock,
      inlineCode: InlineCode,
      kbd: Keyboard,
      link: Link,
    }}
    plugins={[require('remark-kbd')]}
  />
)

interface IKeyboardProps {
  children: string[]
}

const Keyboard: React.FunctionComponent<IKeyboardProps> = ({ children }) => (
  <kbd>{children[0]}</kbd>
)

interface ICodeblockProps {
  language?: string
  value: string
}

const CodeBlock: React.FunctionComponent<ICodeblockProps> = ({
  language,
  value,
}) => {
  if (!language) return <pre>{value}</pre>

  return <Highlight className={`language-${language}`}>{value}</Highlight>
}

interface IInlineCodeProps {
  children: React.ReactNode
}

const InlineCode: React.FunctionComponent<IInlineCodeProps> = ({
  children,
}) => <code className='tag is-code'>{children}</code>

interface ILinkProps {
  children: string[]
  href: string
}

const Link: React.FunctionComponent<ILinkProps> = ({
  children: [text],
  href,
}) => <ExtLink href={href}>{text}</ExtLink>

export default MarkdownRenderer
