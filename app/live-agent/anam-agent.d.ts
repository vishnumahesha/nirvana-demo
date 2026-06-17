// Type declaration for the Anam <anam-agent> web component.
// React 19 scopes the JSX namespace under the `react` module, so we augment
// React.JSX.IntrinsicElements there to allow the custom element in TSX.
import type React from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'anam-agent': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        'agent-id'?: string
        layout?: string
        'ui-text-input'?: string
      }
    }
  }
}
