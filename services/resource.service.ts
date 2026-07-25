import { fileLinkService } from "./file-link.service";
import { lessonContentService } from "./lesson-content.service";

class ResourceService {

  async create(values: {
    lesson_id: string;

    title: string;
    provider: string;
    url: string;

    type: "video" | "document";
    order_index: number;
  }) {

    const file = await fileLinkService.create({
      title: values.title,
      provider: values.provider,
      url: values.url,
    });

    return lessonContentService.create({
      lesson_id: values.lesson_id,
      file_link_id: file.id,
      type: values.type,
      order_index: values.order_index,
    });
  }

  async update(
    resource: any,
    values: {
      title: string;
      provider: string;
      url: string;
      type: "video" | "document";
      order_index: number;
    }
  ) {

    await fileLinkService.update(
      resource.file_link_id,
      {
        title: values.title,
        provider: values.provider,
        url: values.url,
      }
    );

    return lessonContentService.update(
      resource.id,
      {
        type: values.type,
        order_index: values.order_index,
      }
    );
  }

  async delete(resource: any) {

    await lessonContentService.delete(resource.id);

    await fileLinkService.delete(
      resource.file_link_id
    );

  }
}

export const resourceService =
  new ResourceService();