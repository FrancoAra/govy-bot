import { Probot, Context } from "probot";
import YAML from "yaml";

const ISSUE_COMMENTS = {

  govy_setup_after_read_config_failure: "To start using me please create a directory called `.gov` in the root of your project and create a `config.yaml` file in it :).",

  unexpected_error_report: (error: Error) => `**Something went wrong with me!** Please check with my developers.\n\`${error.message}\``,

  proposal_created: "Proposal accepted, thank you for your contribution! (decision system type: influence allocation, resolution, resolution date)"
}

class GovyIssueActions {
  context: Context;
  constructor(context: Context) {
    this.context = context;
  }

  private async commentBack(comment: string) {
    await this.context.octokit.issues
      .createComment(this.context.issue({ body: comment }));
  }

  async commentGovySetup() {
    await this.commentBack(ISSUE_COMMENTS.govy_setup_after_read_config_failure);
  }

  async commentErrorReport(error: Error) {
    await this.commentBack(ISSUE_COMMENTS.unexpected_error_report(error));
  }

  async commentProposalCreated() {
    await this.commentBack(ISSUE_COMMENTS.proposal_created);
  }

  readIssueYaml(): any {
    const body = this.context.payload.issue.body;
    const bodyJson = YAML.parse(body);
    return bodyJson;
  }

  async readRepoYaml(path: string): Promise<any> {
    const context = this.context;
    async function tryWithExtension(extension: ".yaml" | ".yml") {
      const gov = await context.octokit.repos.getContent(context.repo({ path: path+extension }))
      const file: any = gov.data
      const contentJson = YAML.parse(Buffer.from(file.content, "base64").toString());
      return contentJson;
    }
    try {
      return await tryWithExtension(".yaml");
    } catch(error) {
      if (error.toString().includes("Not Found"))
        return await tryWithExtension(".yml");
      else
        throw error;
    }
  }
}

export = (app: Probot) => {
  app.on("issues.opened", async (context) => {
    const govy = new GovyIssueActions(context);

    try {
      context.log.info( JSON.stringify(govy.readIssueYaml()) );

      const config = await govy.readRepoYaml(".gov/config");
      context.log.info(`Config root decision system => ${config["root-decision-system"]}`);
      await govy.commentProposalCreated();

    } catch (error) {
      const notFound: boolean = error.toString().includes("Not Found");
      const emptyRepo: boolean = error.toString().includes("repository is empty")

      if (notFound || emptyRepo)
        await govy.commentGovySetup();
      else
        await govy.commentErrorReport(error);
    }
  });

};
