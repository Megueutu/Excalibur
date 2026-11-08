import type { ComponentType, SVGProps } from 'react'
import Angular from '~icons/simple-icons/angular'
import Css from '~icons/simple-icons/css'
import Dart from '~icons/simple-icons/dart'
import Docker from '~icons/simple-icons/docker'
import Electron from '~icons/simple-icons/electron'
import Flutter from '~icons/simple-icons/flutter'
import Go from '~icons/simple-icons/go'
import Html from '~icons/simple-icons/html5'
import Java from '~icons/simple-icons/openjdk'
import JavaScript from '~icons/simple-icons/javascript'
import Kotlin from '~icons/simple-icons/kotlin'
import Markdown from '~icons/simple-icons/markdown'
import NestJs from '~icons/simple-icons/nestjs'
import NextJs from '~icons/simple-icons/nextdotjs'
import NodeJs from '~icons/simple-icons/nodedotjs'
import Php from '~icons/simple-icons/php'
import Python from '~icons/simple-icons/python'
import React from '~icons/simple-icons/react'
import Ruby from '~icons/simple-icons/ruby'
import Rust from '~icons/simple-icons/rust'
import Shell from '~icons/simple-icons/gnubash'
import Spring from '~icons/simple-icons/spring'
import Svelte from '~icons/simple-icons/svelte'
import Swift from '~icons/simple-icons/swift'
import Tailwind from '~icons/simple-icons/tailwindcss'
import TypeScript from '~icons/simple-icons/typescript'
import Vite from '~icons/simple-icons/vite'
import Vue from '~icons/simple-icons/vuedotjs'

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

/**
 * Stack technologies the detectors can report (linguist-js for the language,
 * @specfy/stack-analyser for frameworks and tools), keyed by the id the detectors use.
 * Icons come from Simple Icons (CC0), all single color. A technology that is not here
 * simply shows no icon; it never falls back to a colored logo.
 */
export const STACK: Record<string, { label: string; icon: IconComponent }> = {
  angular: { label: 'Angular', icon: Angular },
  css: { label: 'CSS', icon: Css },
  dart: { label: 'Dart', icon: Dart },
  docker: { label: 'Docker', icon: Docker },
  electron: { label: 'Electron', icon: Electron },
  flutter: { label: 'Flutter', icon: Flutter },
  go: { label: 'Go', icon: Go },
  html: { label: 'HTML', icon: Html },
  java: { label: 'Java', icon: Java },
  javascript: { label: 'JavaScript', icon: JavaScript },
  kotlin: { label: 'Kotlin', icon: Kotlin },
  markdown: { label: 'Markdown', icon: Markdown },
  nestjs: { label: 'NestJS', icon: NestJs },
  nextjs: { label: 'Next.js', icon: NextJs },
  nodejs: { label: 'Node.js', icon: NodeJs },
  php: { label: 'PHP', icon: Php },
  python: { label: 'Python', icon: Python },
  react: { label: 'React', icon: React },
  ruby: { label: 'Ruby', icon: Ruby },
  rust: { label: 'Rust', icon: Rust },
  shell: { label: 'Shell', icon: Shell },
  spring: { label: 'Spring', icon: Spring },
  svelte: { label: 'Svelte', icon: Svelte },
  swift: { label: 'Swift', icon: Swift },
  tailwindcss: { label: 'Tailwind CSS', icon: Tailwind },
  typescript: { label: 'TypeScript', icon: TypeScript },
  vite: { label: 'Vite', icon: Vite },
  vue: { label: 'Vue', icon: Vue },
}
