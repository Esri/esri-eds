# Coding Standards

## Comments

Use CSS-style comments for code that is not self-explanatory. The should be a space between the comment and the asterisk.
    
`/* This is a comment */`

## Double Quotes

Use double quotes for values that accept them.

`background-image: url("image.jpg");`

## Selector Blocks

- Must include a space after the selector.
- Must include a space after the colon.
- Must include a space before the opening brace.
- Must use one line per property.
- Must include one line of white space after rule.
- Should include terminating semicolon on last property.

Bad
```
.foo{color:#000; background-color: #fff;}
.bar {
    color: #000;
    background-color: #fff
}
```

Good
```
.foo { 
    color: #000; 
    background-color: #fff;
 }

.bar {
    color: #000;
    background-color: #fff
}
```

## Values

- Should use existing variables when available.
- If a value is used more than once, it should be a variable.

Bad
```
.foo {
    color: #000;
    font-size: 16px;
}
```

Good
```
.foo {
    color: var(--color-black);
    font-size: var(--font-1);
}
```

Best practice is to include fallback value for variables. This is not strictly required, but is recommended.

`color: var(--color-black, #000);`


## Property Units

- Should use relative units.
- Should existing variables when available. 

## Nesting

- Preproceesors should not be used. Native CSS nesting may be used. 
- Nesting must be limited to 3 levels deep.

## Media Queries

If media queries are used to target different viewports, they should be placed smallest to largest. 

```
@media (min-width: 480px) {
 /* CSS for small screens */
}

@media (min-width: 768px) {
 /* CSS for medium screens */
}

@media (min-width: 1024px) {
 /* CSS for large screens */
}
``` 

## Specificity

- Should use the lowest specificity possible.
- Should avoid using IDs in CSS.
- Must not use `!important`. If important is used, it should be documented in the code why it is necessary.