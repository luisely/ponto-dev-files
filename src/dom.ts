/**
 * Referências aos elementos do DOM usados pela aplicação.
 * Todos são resolvidos no carregamento do módulo, então este arquivo
 * deve ser importado após o DOM estar pronto (após o <script> no fim do body).
 */

export const inputDate = document.getElementById('date') as HTMLInputElement
export const inputTime = document.getElementById('time') as HTMLInputElement
export const btnRegister = document.getElementById('registerBtn') as HTMLButtonElement
export const menuBtn = document.getElementById('menuBtn') as HTMLButtonElement
export const tabelaDiv = document.getElementById('divPontos') as HTMLDivElement
export const welcomeTitle = document.getElementById('welcomeTitle') as HTMLElement
