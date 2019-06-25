const sharp = require("sharp");
const path = require("path");
import * as _ from "lodash";
import { TemplateInterface, Space } from "./template/template.interface";
import { TemplateLoader } from "./template/template-loader";
import { calculateWidthHeight } from "./helper";
export * from "./template/template.interface";

const questionmarkPhoto = path.join(__dirname, "./images/questionmark.png");
const defaultBackgroundPhoto = path.join(
  __dirname,
  "./images/default-background.jpg"
);

export class Maker {
  /**
   * Creates a new collage and returns the buffer.
   * @param template The template used to create the collage.
   * @param photos List of photos. According to the template, the max. length of the array is given.
   */
  async createCollage(template: TemplateInterface, photos: string[] = []) {
    const templateLoader = new TemplateLoader(template);

    // create overlay photos
    const composites = await this.createComposites(templateLoader, photos);

    const { contentSize, border } = templateLoader.getPhotoSizes();
    let sharpInstance = sharp(
      templateLoader.getBackground() || defaultBackgroundPhoto
    ).resize(contentSize);
    if (border) sharpInstance = sharpInstance.extend(border);
    return sharpInstance
      .composite(composites)
      .jpeg()
      .toBuffer();
  }

  private createComposites(templateLoader: TemplateLoader, photos: string[]) {
    return Promise.all(
      templateLoader
        .getComposites()
        .map(async (space: Space, index: number) => {
          const photoToAdd = photos[index] || questionmarkPhoto;
          try {
            return this.createComposite(photoToAdd, space);
          } catch (error) {
            throw new Error(`Can't add ${photoToAdd}: ${error.message}`);
          }
        })
    );
  }

  private async createComposite(photoToAdd: string, space: Space) {
    const { width, height } = calculateWidthHeight(
      space.width,
      space.height,
      space.border
    );

    let input = sharp(photoToAdd)
      .png()
      .resize(width, height, { fit: "inside" });
    if (space.border) input = input.extend(space.border);
    input = await input.toBuffer();

    if (space.rotation) {
      input = await sharp(input)
        .rotate(space.rotation, {
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer();
      input = await sharp(input)
        .resize(width, height, { fit: "inside" })
        .toBuffer();
    }
    return {
      input,
      top: space.y,
      left: space.x
    };
  }
}
