import * as path from 'path';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import { readDirDeepSync } from 'read-dir-deep';
import { Injectable } from '@nestjs/common';

export type ParamsType = {
  templateName: string;
};

@Injectable()
export class TemplateService {
  private readonly TEMPLATE_PATH: string = 'src/templates';

  private templatesMap: Map<string, (d: any) => string>;

  constructor() {
    this.load();
  }

  public getTemplateHTML(params: ParamsType, data: object): string {
    const template = this.getTemplate(params);

    if (!template) {
      throw new Error('template-not-found');
    }

    return template(data);
  }

  private getTemplate(params: ParamsType): (data: any) => string {
    const { templateName } = params;
    return this.templatesMap.get(this.getTemplateKey(templateName));
  }

  private load(): void {
    const templatesDir: string = path.join(process.cwd(), this.TEMPLATE_PATH);
    const templateFilePathsWithNames: string[] = readDirDeepSync(templatesDir);

    this.templatesMap = templateFilePathsWithNames.reduce(
      (acc, templatePathWithName) => {
        const template: string = fs.readFileSync(templatePathWithName, {
          encoding: 'utf-8',
        });

        const templateName: string = templatePathWithName
          .replace(/^src\/templates\//, '')
          .replace(/\.hbs$/, '');
        return acc.set(
          this.getTemplateKey(templateName),
          handlebars.compile(template),
        );
      },
      new Map(),
    );
  }

  private getTemplateKey(templateName: string): string {
    return `${templateName}W`;
  }
}
