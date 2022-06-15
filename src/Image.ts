import type * as PIXI from 'pixi.js';

import { addPixiSprite, PixiSpriteOptions } from './PixiUtils';
import Subsprites from './Subsprites';
import { animateIndependent } from './AnimationTimeline';
import type { Vec2 } from "./Vec";

// The serialized version of the interface changes the interface to allow only the data
// that can be serialized in JSON.  It may exclude data that is not neccessary to
// rehydrate the JSON into an entity
export type IImageSerialized = {
  sprite: {
    x: number,
    y: number,
    scale: { x: number, y: number },
    animationOrImagePath: string,
    // A list of sprite jids (jordan identifier for subsprites)
    children: string[],
  },
  mask?: string,
};
export interface IImage {
  // Not to be serialized
  sprite: PIXI.Sprite;
  // Sprite that acts as a mask
  mask?: string,
}
export function create(
  coords: Vec2,
  spritesheetId: string,
  parent: PIXI.Container,
  pixiSpriteOptions?: PixiSpriteOptions
): IImage {
  const sprite = addPixiSprite(spritesheetId, parent, pixiSpriteOptions);
  sprite.anchor.x = 0.5;
  sprite.anchor.y = 0.5;
  sprite.rotation = 0;

  const image: IImage = {
    sprite,
  };
  setPosition(image, coords);
  return image;
}
export function cleanup(image?: IImage) {
  // Remove PIXI sprite
  if (image && image.sprite && image.sprite.parent) {
    // Remove subsprites
    image.sprite.removeChildren();
    image.sprite.parent.removeChild(image.sprite);
  }
}
// changeSprite changes the still image or animation of a sprite
// Note: if playing a temporary animation, opt for Unit.playAnimation
// because it has built in protections for returning to the correct  
// default sprite
export function changeSprite(image: IImage | undefined, sprite: PIXI.Sprite) {
  if (!image) {
    return;
  }
  const filters = image.sprite.filters;
  sprite.x = image.sprite.x;
  sprite.y = image.sprite.y;
  sprite.scale.x = image.sprite.scale.x;
  sprite.scale.y = image.sprite.scale.y;
  sprite.anchor.x = image.sprite.anchor.x;
  sprite.anchor.y = image.sprite.anchor.y;
  // Save children before they are removed
  const children = [...image.sprite.children];
  // Save mask
  const mask = image.sprite.mask;
  cleanup(image);
  image.sprite = sprite;
  // Keep filters from previous sprite
  image.sprite.filters = filters;
  restoreSubsprites(image);
  // Transfer children to new sprite
  for (let child of children) {
    sprite.addChild(child);
  }
  // restore mask:
  sprite.mask = mask;
}
// Converts an Image entity into a serialized form
// that can be saved as JSON and rehydrated later into
// a full Image entity.
// Returns only the properties that can be saved
// callbacks and complicated objects such as PIXI.Sprites
// are removed
export function serialize(image: IImage): IImageSerialized {
  return {
    sprite: {
      x: image.sprite.x,
      y: image.sprite.y,
      scale: { x: image.sprite.scale.x, y: image.sprite.scale.y },
      animationOrImagePath: getAnimationPathFromSprite(image.sprite),
      children: image.sprite.children.map(c => c.jid)

    },
  };
}
// Reinitialize an Image from IImageSerialized JSON
// this is useful when loading game state after reconnect
// This is the opposite of serialize
export function load(image: IImageSerialized | undefined, parent: PIXI.Container): IImage | undefined {
  if (!image) {
    return undefined;
  }
  const copy = { ...image };
  const { scale, animationOrImagePath } = copy.sprite;
  if (!animationOrImagePath) {
    // Missing image path
    console.error('Cannot load image, missing image path')
    return;
  }
  // Recreate the sprite using the create function so it initializes it properly
  const newImage = create(copy.sprite, animationOrImagePath, parent);
  newImage.sprite.scale.set(scale.x, scale.y);
  // Restore subsprites (the actual sprites)
  restoreSubsprites(newImage);

  return newImage;
}
export function getAnimationPathFromSprite(sprite: PIXI.Sprite): string {
  const textureCacheIds = sprite._texture.textureCacheIds;
  const animationOrImagePath = textureCacheIds[0] ? textureCacheIds[0].replace(/_\d+.png/g, "") : '';
  return animationOrImagePath;

}
export function getSubspriteJids(image: IImage | IImageSerialized): string[] {
  // @ts-ignore: jid is a property that i've added and is not a part of the PIXI type
  return image.sprite.children.filter(c => c !== undefined).map(c => c.jid);
}
// syncronize updates an existing originalImage to match the properties of imageSerialized
// mutates originalImage
// TODO test for memory leaks
export function syncronize(imageSerialized: IImageSerialized, originalImage?: IImage): IImage | undefined {
  if (!originalImage) {
    return undefined;
  }
  if (imageSerialized.sprite.animationOrImagePath === getAnimationPathFromSprite(originalImage.sprite)) {
    // then we only need to update properties:
    const { x, y, scale } = imageSerialized.sprite;
    originalImage.sprite.x = x;
    originalImage.sprite.y = y;
    originalImage.sprite.scale.x = scale.x
    originalImage.sprite.scale.y = scale.y;
    if (getSubspriteJids(imageSerialized) != getSubspriteJids(originalImage)) {
      restoreSubsprites(originalImage);
    }
    return originalImage;
  } else {
    // if the textures do not match, then the sprite is majorly out of sync and it's
    // best to just load()
    // --
    // Clean up old image and completely replace
    const newImage = load(imageSerialized, originalImage.sprite.parent);
    cleanup(originalImage);
    return newImage;
  }

}
export function restoreSubsprites(image?: IImage) {
  if (!image) {
    return;
  }
  // Re-add subsprites
  const subSprites = getSubspriteJids(image);
  image.sprite.removeChildren();
  for (let subSprite of subSprites) {
    addSubSprite(image, subSprite);
  }
  // Re-add mask:
  if (image.mask) {
    addMask(image, image.mask);
  }
}
export function removeMask(image: IImage) {
  if (image.sprite.mask) {
    try {
      // @ts-ignore
      image.sprite.removeChild(image.sprite.mask);
    } catch (e) {
      console.log('ignore error', e);
    }
    image.sprite.mask = null;
    image.mask = undefined;
  }

}
export function addMask(image: IImage, path: string) {
  if (image.mask !== path) {
    // remove old mask:
    removeMask(image);
    const mask = addPixiSprite(path, image.sprite);
    mask.anchor.set(0.5);
    image.sprite.mask = mask;
    image.mask = path;
  }
}
export function setPosition(image: IImage | undefined, pos: Vec2) {
  if (!image) {
    return;
  }
  image.sprite.x = pos.x;
  image.sprite.y = pos.y;
}
export function scale(image: IImage | undefined, scale: number): Promise<void> {
  if (!image) {
    return Promise.resolve();
  }
  // Clamp to a positive value
  scale = Math.max(0, scale);
  return animateIndependent([
    {
      sprite: image.sprite,
      target: { scale },
    },
  ]);
}
export function addSubSprite(image: IImage | undefined, key: string) {
  if (!image) {
    return;
  }
  // Don't add more than one copy
  if (!getSubspriteJids(image).includes(key)) {
    const subSpriteData = Subsprites[key];
    if (subSpriteData) {
      const sprite = addPixiSprite(subSpriteData.imageName, image.sprite);
      // @ts-ignore: jid is a property that i've added and is not a part of the PIXI type
      sprite.jid = key;
      sprite.alpha = subSpriteData.alpha;
      sprite.anchor.set(subSpriteData.anchor.x, subSpriteData.anchor.y);
      sprite.scale.set(subSpriteData.scale.x, subSpriteData.scale.y);
    } else {
      console.error("Missing subsprite data")
    }
  }
}
export function removeSubSprite(image: IImage | undefined, key: string) {
  if (!image) {
    return;
  }
  // @ts-ignore: jid is a property that i've added and is not a part of the PIXI type
  const subSprite = image.sprite.children.find(c => c.jid == key)
  if (subSprite) {
    // Remove PIXI.Sprite instance
    subSprite.parent.removeChild(subSprite);
  } else {
    console.log('Cannot remove subsprite', key, 'subsprite is missing from sprite.children');
  }
}
export function move(image: IImage, x: number, y: number) {
  return animateIndependent([
    {
      sprite: image.sprite,
      target: { x, y },
    },
  ]);
}
export function show(image?: IImage): Promise<void> {
  if (!image) {
    return Promise.resolve();
  }
  return animateIndependent([
    {
      sprite: image.sprite,
      target: { alpha: 1 },
    },
  ]);
}
export function hide(image?: IImage) {
  if (!image) {
    return Promise.resolve();
  }
  return animateIndependent([
    {
      sprite: image.sprite,
      target: { alpha: 0 },
    },
  ]);
}