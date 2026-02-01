import { promises as fs } from "fs";
import path from "path";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OwnerAppDescriptionPage() {
  const filePath = path.join(process.cwd(), "docs", "OWNER_APP_DESCRIPTION.md");
  const content = await fs.readFile(filePath, "utf-8");

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Descrição oficial do aplicativo</CardTitle>
          <p className="text-sm text-muted-foreground">
            Esta é a documentação oficial do produto. Última atualização:
            01/02/2026.
          </p>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {content}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
