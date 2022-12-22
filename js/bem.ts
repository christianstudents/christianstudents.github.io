/**
 * A dictionary specifying modifiers to add onto a BEM element and their corresponding values.
 */
type ModifierDict = Record<
  string | number,
  boolean | string | number | null | undefined
>;

/**
 * A function that specifies a sub-component within a BEM block. It can take an Element name and/or
 * a list/dict of Modifiers as a query to narrow down the set of elements it selects.
 */
interface SpecifierType<RootElementType extends Element = HTMLElement> {
  <NestedElementType extends Element = HTMLElement>(
    modifiers: (string | number)[] | ModifierDict
  ): NestedBEMType<RootElementType, NestedElementType>;
  <NestedElementType extends Element = HTMLElement>(
    elementName?: string | number | null | undefined,
    modifiers?: null | undefined | (string | number)[] | ModifierDict
  ): NestedBEMType<RootElementType, NestedElementType>;
}

/**
 * An object that provides methods and properties for interacting with a set of elements selected by
 * a specifier query.
 */
interface NestedBEMType<
  RootElementType extends Element = HTMLElement,
  NestedElementType extends Element = HTMLElement
> {
  /**
   * An Array of the classes for the modifiers and element name specified. The first item will be
   * the block and element name with no modifiers, and subsequent items will be the block and
   * element names with modifiers attached.
   */
  readonly classes: readonly string[];
  /**
   * The full class name as a space-delimited  string for the modifiers and element name specified.
   * The first class in the string will be the block and element name with no modifiers, and
   * subsequent classes will be the block and element names with modifiers attached.
   */
  readonly className: string;
  /**
   * Selects and returns all elements matching the specified query.
   * @returns An array of Elements matching the specified component name, element name, and
   *          modifiers.
   */
  readonly select: () => NestedElementType[];
  readonly modify: {
    /**
     * Adds, removes, and alters modifiers on the set of elements matched by the specified query. If
     * this object has not been `lock`ed, this may cause some elements to no longer be matched by this
     * query.
     * @param newModifiers A dictionary of new modifier key/value pairs to set on the element.
     */
    (newModifiers: ModifierDict, elements?: null | undefined): void;
    /**
     * Adds, removes, and alters modifiers on the element passed in.
     * @param newModifiers A dictionary of new modifier key/value pairs to set on the element.
     */
    (newModifiers: ModifierDict, element: NestedElementType): void;
    /**
     * Adds, removes, and alters modifiers on the elements passed in.
     * @param newModifiers A dictionary of new modifier key/value pairs to set on the element.
     */
    (newModifiers: ModifierDict, elements: Iterable<NestedElementType>): void;
  };
  /**
   * Locks the set of elements matched by the specified query. Using this method will cause `select`
   * to return the same set of elements and `modify` to act on those elements until `unlock` is
   * called, even if one of the underlying elements no longer matches the query.
   */
  readonly lock: () => void;
  /**
   * Unlocks the set of elements matched by the specified query (undoing the effects of `lock`).
   * This lets `select` and `modify` return and act on up-to-date elements every time instead of the
   * old set of elements.
   */
  readonly unlock: () => void;
  /**
   * Returns the first parent element that matches the root block element class. This should be the
   * root block element for this component. If no parent is found, null is returned. If the element
   * passed in already matches the root block element class, it is returned.
   * @param element The element to return the root block element for.
   * @returns The root block element, or null if there is none.
   */
  readonly root: (element: NestedElementType) => RootElementType | null;
  /**
   * @returns An iterator over the elements matched by the specified query.
   */
  [Symbol.iterator]: () => IterableIterator<NestedElementType>;
  /**
   * @returns The class name representation of the specified query (equivalent to `className`).
   */
  toString: () => string;
}

/**
 * A combination of {@link SpecifierType} type and {@link NestedBEMType}. The methods and properties
 * from the {@link NestedBEMType} apply to the base Block element selected by this BEM instance. It
 * can also be called as a function to further specify an individual Element name with Modifiers,
 * and returns another {@link NestedBEMType} for that query.
 */
type BaseBEMType<RootElementType extends Element = HTMLElement> = NestedBEMType<
  RootElementType,
  RootElementType
> &
  SpecifierType;

/**
 * An interface for interacting with and modifying elements according to the
 * {@link https://getbem.com/ BEM specification}.
 *
 * This function creates a {@link BaseBEMType} object. The function takes an Block name which is
 * applied to the Block element as a class and provides methods and properties for interacting with
 * elements on the page that are associated with this element.
 * @param blockName
 * @returns A {@link BaseBEMType} object that can interact with all Block elements with the given
 *          `blockName`, or can be called with an Element name and/or Modifiers for further
 *          narrowing down the set of elements it selects.
 *
 * @example
 * ```ts
 * const bem = BEM("some-block-component");
 * bem("a-nested-element").className
 * // "some-block-component__a-nested-element"
 * bem({ modifier1: true, modifier2: false, modifier3: "value" }).className
 * // "some-block-component some-block-component--modifier1 some-block-component--modifier3-value";
 * bem("another-element", { modifier4: true }).classes
 * // ["some-block-component__another-element", "some-block-component__another-element--modifier4"]
 * bem("yet-element").select()
 * // An Array of elements with class name "some-block-component__yet-element"
 * bem("and-another").modify({ modifier1: false, modifier2: true });
 * // Modifies ".some-block-component__and-another" elements:
 * // 1. Removes any "some-block-component__and-another--modifier1" classes, if any
 * // 2. Adds a "some-block-component__and-another--modifier2" class
 * ```
 */
const BEM = <RootElementType extends Element = HTMLElement>(
  blockName: string
): BaseBEMType<RootElementType> => {
  // Make any empty calls to the specifier (i.e., `specifier()`) return the same object instead of
  // creating a new one each time.
  let emptySpecifier: NestedBEMType<RootElementType, RootElementType> | null =
    null;

  const specifier: SpecifierType<RootElementType> = <
    NestedElementType extends Element = HTMLElement
  >(
    elementName?:
      | null
      | undefined
      | string
      | number
      | (string | number)[]
      | Record<string | number, boolean | string | number | null | undefined>,
    modifiers?:
      | null
      | undefined
      | (string | number)[]
      | Record<string | number, boolean | string | number | null | undefined>
  ): NestedBEMType<RootElementType, NestedElementType> => {
    // Check if only a modifier list/dict was provided, and assume "" for the element name.
    if (typeof elementName === "object" && elementName !== null) {
      modifiers = elementName;
      elementName = "";
    }
    if (elementName == null) {
      elementName = "";
    }
    if (typeof elementName === "number") {
      elementName = elementName.toString();
    }

    const qualifiedElementName = `${blockName}${
      elementName === "" ? "" : "__" + elementName
    }`;

    if (modifiers == null) {
      modifiers = [];
    } else if (!Array.isArray(modifiers)) {
      modifiers = Object.entries(modifiers).flatMap(([modifier, value]) =>
        value == null || value === false
          ? []
          : value === true
          ? [modifier]
          : [`${modifier}-${value}`]
      );
    }

    const mappedModifiers = modifiers.map(
      (modifier) => `${qualifiedElementName}--${modifier}`
    );

    // Use the `emptySpecifier` if this function was called with no specifying query.
    if (
      elementName === "" &&
      modifiers.length === 0 &&
      emptySpecifier != null
    ) {
      return emptySpecifier as unknown as NestedBEMType<
        RootElementType,
        NestedElementType
      >;
    }

    // Set to `null` if `unlock`ed and a set Array of elements (that get returned every time) if
    // `lock`ed.
    let lockedCollection: NestedElementType[] | null = null;

    // Calculate the list of classes and freeze the Array to prevent tampering.
    const classes = Object.freeze(
      [qualifiedElementName].concat(mappedModifiers)
    );
    // Just join the classes to generate the className.
    const className: NestedBEMType<
      RootElementType,
      NestedElementType
    >["className"] = classes.join(" ");
    const select: NestedBEMType<
      RootElementType,
      NestedElementType
    >["select"] = (): NestedElementType[] =>
      Array.from(
        lockedCollection
          ? lockedCollection
          : (document.getElementsByClassName(
              className
            ) as HTMLCollectionOf<NestedElementType>)
      );
    const modify: NestedBEMType<
      RootElementType,
      NestedElementType
    >["modify"] = (
      newModifiers: ModifierDict,
      elements?:
        | null
        | undefined
        | NestedElementType
        | Iterable<NestedElementType>
    ): void => {
      const elementIter =
        elements == null
          ? select()
          : elements instanceof Element
          ? [elements]
          : elements;

      for (const modifier in newModifiers) {
        // Determine the new modifier class to add.
        const value = newModifiers[modifier];
        const newClass =
          value == null || value === false || value === ""
            ? null
            : value === true
            ? modifier
            : `${modifier}-${value}`;

        // Remove any other classes that match this modifier.
        const re = new RegExp(
          `(?:^| )${qualifiedElementName}--${modifier}(?:-[^ ]*)?(?:$| )`
        );
        for (const element of elementIter) {
          let match: ReturnType<string["match"]>;
          while ((match = element.className.match(re))) {
            element.classList.remove(match[0].trim());
          }
          if (newClass != null) {
            element.classList.add(`${qualifiedElementName}--${newClass}`);
          }
        }
      }
    };
    const lock: NestedBEMType<
      RootElementType,
      NestedElementType
    >["lock"] = (): void => {
      lockedCollection = Array.from(select());
    };
    const unlock: NestedBEMType<
      RootElementType,
      NestedElementType
    >["unlock"] = (): void => {
      lockedCollection = null;
    };
    const root: NestedBEMType<RootElementType, NestedElementType>["root"] = (
      element: NestedElementType
    ): RootElementType | null => {
      for (
        let current: Node | null = element;
        current instanceof Element;
        current = current.parentNode
      ) {
        if (current.classList.contains(blockName)) {
          return current as RootElementType;
        }
      }
      return null;
    };

    return {
      classes,
      className,
      select,
      modify,
      lock,
      unlock,
      root,
      [Symbol.iterator]: () => select()[Symbol.iterator](),
      toString: () => className,
    };
  };

  emptySpecifier = specifier();
  // Merge the `emptySpecifier` (which is of type `NestedBEMType`) into the `specifier` so that it
  // can be made into a `BaseBEMType`, which is a combination of the two.
  Object.assign(specifier, emptySpecifier);

  return specifier as unknown as BaseBEMType<RootElementType>;
};

// Additionally export a set of already-made BEM objects for common names we use throughout multiple
// files.
export const button = BEM("button");
export const pageContent = BEM("page-content");
export const imgAspectRatio = BEM("img-aspect-ratio");
BEM.button = button;
BEM.pageContent = pageContent;
BEM.imgAspectRatio = imgAspectRatio;

export default BEM;
