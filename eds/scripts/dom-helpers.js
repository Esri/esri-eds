/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-disable no-param-reassign */

/**
 * Example Usage:
 *
 * domEl('main',
 *  div({ class: 'card' },
 *  a({ href: item.path },
 *    div({ class: 'card-thumb' },
 *     createOptimizedPicture(item.image, item.title, 'lazy', [{ width: '800' }]),
 *    ),
 *   div({ class: 'card-caption' },
 *      h3(item.title),
 *      p({ class: 'card-description' }, item.description),
 *      p({ class: 'button-container' },
 *       a({ href: item.path, 'aria-label': 'Read More', class: 'button primary' }, 'Read More'),
 *     ),
 *   ),
 *  ),
 * )
 */

/**
 * Helper for more concisely generating DOM Elements with attributes and children
 * @param {string} tag HTML tag of the desired element
 * @param  {[Object?, ...Element]} items: First item can optionally be an object of attributes,
 *  everything else is a child element
 * @returns {Element} The constructred DOM Element
 */
export function domEl(tag, ...items) {
  const element = document.createElement(tag);

  if (!items || items.length === 0) return element;

  if (
    !(items[0] instanceof Element || items[0] instanceof HTMLElement)
    && typeof items[0] === 'object'
  ) {
    const [attributes, ...rest] = items;
    items = rest;

    Object.entries(attributes).forEach(([key, value]) => {
      if (!key.startsWith('on')) {
        element.setAttribute(
          key,
          Array.isArray(value) ? value.join(' ') : value,
        );
      } else {
        element.addEventListener(key.substring(2).toLowerCase(), value);
      }
    });
  }

  items.forEach((item) => {
    item = item instanceof Element || item instanceof HTMLElement
      ? item
      : document.createTextNode(item);
    element.appendChild(item);
  });

  return element;
}

/*
 More short hand functions can be added for very common DOM elements below.
 domEl function from above can be used for one off DOM element occurrences.
 */
export function div(...items) {
  return domEl('div', ...items);
}

export function p(...items) {
  return domEl('p', ...items);
}

export function a(...items) {
  return domEl('a', ...items);
}

export function link(...items) {
  return domEl('link', ...items);
}

export function h1(...items) {
  return domEl('h1', ...items);
}

export function h2(...items) {
  return domEl('h2', ...items);
}

export function h3(...items) {
  return domEl('h3', ...items);
}

export function h4(...items) {
  return domEl('h4', ...items);
}

export function h5(...items) {
  return domEl('h5', ...items);
}

export function h6(...items) {
  return domEl('h6', ...items);
}

export function ul(...items) {
  return domEl('ul', ...items);
}

export function ol(...items) {
  return domEl('ol', ...items);
}

export function li(...items) {
  return domEl('li', ...items);
}

export function i(...items) {
  return domEl('i', ...items);
}

export function img(...items) {
  return domEl('img', ...items);
}

export function video(...items) {
  return domEl('video', ...items);
}

export function source(...items) {
  return domEl('source', ...items);
}

export function span(...items) {
  return domEl('span', ...items);
}

export function form(...items) {
  return domEl('form', ...items);
}

export function input(...items) {
  return domEl('input', ...items);
}

export function label(...items) {
  return domEl('label', ...items);
}

export function button(...items) {
  return domEl('button', ...items);
}

export function iframe(...items) {
  return domEl('iframe', ...items);
}

export function nav(...items) {
  return domEl('nav', ...items);
}

export function fieldset(...items) {
  return domEl('fieldset', ...items);
}

export function article(...items) {
  return domEl('article', ...items);
}

export function strong(...items) {
  return domEl('strong', ...items);
}

export function select(...items) {
  return domEl('select', ...items);
}

export function option(...items) {
  return domEl('option', ...items);
}

export function horizontalRule(...items) {
  return domEl('hr', ...items);
}

export function script(...items) {
  return domEl('script', ...items);
}

export function calciteButton(...items) {
  return domEl('calcite-button', ...items);
}

export function calciteLink(...items) {
  return domEl('calcite-link', ...items);
}

export function calciteIcon(...items) {
  return domEl('calcite-icon', ...items);
}

/**
 * Creates and returns an SVG element with the specified child elements or attributes.
 *
 * @param {...any} items - A variable number of arguments, including child elements and attributes,
 *                         that are to be applied to the created SVG element. These arguments are
 *                         spread into the `domEl` function call.
 *
 * @return {Element} The created SVG DOM element with the specified attributes and child elements.
 */
export function svg(...items) {
  return domEl('svg', ...items);
}

/**
 * Creates a DOM element representing a circle.
 *
 * @param {...any} items - A rest parameter that collects all arguments passed to the function,
 *   intended to be attributes or child elements relevant to the circle.
 *
 * @return {Element} - Returns a DOM element of type 'circle' appropriately configured with any
 *   provided items.
 */
export function circle(...items) {
  return domEl('circle', ...items);
}
