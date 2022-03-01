/**
 * @jest-environment jsdom
 */

import { render, RenderResult } from "@testing-library/svelte"
// import Home from "./Home.svelte"

/**
 * An example test suite outlining the usage of
 * `describe()`, `beforeEach()`, `test()` and `expect()`
 *
 * @see https://jestjs.io/docs/getting-started
 * @see https://github.com/testing-library/jest-dom
 */

// describe("Home", () => {
//   let renderedComponent: RenderResult

//   beforeEach(() => {
//     renderedComponent = render(Home)
//   })

//   describe("once the component has been rendered", () => {
//     test("should show the proper heading", () => {
//       expect(renderedComponent.getByText(/That Paper Game/)).toBeInTheDocument()
//     })
//   })
// })

it("works", () => {
  expect(1 + 1).toBe(2)
})
