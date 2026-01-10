import { tabelaDiv } from './vars3.js'

export function renderSkeleton() {
	const skeletonHTML = `
          <div class="animate-pulse">
            <div class="h-8 text-center rounded-t bg-stone-500/15 border border-white/5 dark:text-stone-300"></div>
            <div class="h-8 flex justify-between items-center px-1 py-1 mb-1 border-b border-l border-r rounded-b border-white/5 bg-zinc-900">
                <div class="text-md mx-2"></div>
                <div class="text-md mx-2"></div>
                <div class="text-md mx-2"></div>
                <div class="text-md mx-2"></div>
            </div>
          </div>
          <div class="animate-pulse">
            <div class="h-8 text-center rounded-t bg-stone-500/15 border border-white/5 dark:text-stone-300"></div>
            <div class="h-8 flex justify-between items-center px-1 py-1 mb-1 border-b border-l border-r rounded-b border-white/5 bg-zinc-900">
                <div class="text-md mx-2"></div>
                <div class="text-md mx-2"></div>
                <div class="text-md mx-2"></div>
                <div class="text-md mx-2"></div>
            </div>
          </div>
          <div class="animate-pulse">
            <div class="h-8 text-center rounded-t bg-stone-500/15 border border-white/5 dark:text-stone-300"></div>
            <div class="h-8 flex justify-between items-center px-1 py-1 mb-1 border-b border-l border-r rounded-b border-white/5 bg-zinc-900">
                <div class="text-md mx-2"></div>
                <div class="text-md mx-2"></div>
                <div class="text-md mx-2"></div>
                <div class="text-md mx-2"></div>
            </div>
          </div>
          <div class="animate-pulse">
            <div class="h-8 text-center rounded-t bg-stone-500/15 border border-white/5 dark:text-stone-300"></div>
            <div class="h-8 flex justify-between items-center px-1 py-1 mb-1 border-b border-l border-r rounded-b border-white/5 bg-zinc-900">
                <div class="text-md mx-2"></div>
                <div class="text-md mx-2"></div>
                <div class="text-md mx-2"></div>
                <div class="text-md mx-2"></div>
            </div>
          </div>
        </div>
      `
	tabelaDiv.innerHTML = skeletonHTML
}
