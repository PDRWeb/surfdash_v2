import type { ReactNode } from 'react'

const iconClass = 'w-4 h-4 shrink-0'

function GitHubIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  )
}

interface FooterLinkProps {
  href: string
  event: string
  children: ReactNode
}

function FooterLink({ href, event, children }: FooterLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-umami-event={event}
      className="inline-flex items-center gap-xs text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors"
    >
      {children}
    </a>
  )
}

interface SidebarFooterProps {
  variant?: 'sidebar' | 'mobile'
}

export function SidebarFooter({ variant = 'sidebar' }: SidebarFooterProps) {
  const eventPrefix = variant === 'mobile' ? 'mobile' : 'sidebar'
  const isMobile = variant === 'mobile'

  const attribution = (
    <p className={`text-xs text-on-surface-variant leading-relaxed ${isMobile ? 'mb-0 min-w-0' : 'mb-sm'}`}>
      Created and maintained by
      <br />
      Paul David Rodriguez.
    </p>
  )

  const links = (
    <div className={`flex flex-col gap-xs ${isMobile ? 'items-end shrink-0' : ''}`}>
      <FooterLink href="https://github.com/PDRWeb/surfdash_v2" event={`${eventPrefix}-github`}>
        <GitHubIcon />
        <span>Source</span>
      </FooterLink>
      <FooterLink href="https://pdrfoto.com" event={`${eventPrefix}-website`}>
        <GlobeIcon />
        <span>Website</span>
      </FooterLink>
    </div>
  )

  return (
    <footer
      className={
        variant === 'sidebar'
          ? 'mt-auto shrink-0 border-t border-outline-variant/20 pt-md px-md'
          : 'md:hidden flex items-start justify-between gap-md border-t border-outline-variant/20 pt-md px-margin-mobile pb-md mt-lg'
      }
    >
      {attribution}
      {links}
    </footer>
  )
}
