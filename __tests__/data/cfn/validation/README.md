# CloudFormation diagram validation stacks

このフォルダには、構成図生成機能を確認するための最小Stack群を置いています。

| Template | 確認対象 |
|---|---|
| `vpc-foundation.yaml` | VPC / AZ / Public・Private Subnet / IGW / Export |
| `api-application.yaml` | API Gateway → Lambda → DynamoDB、`Fn::Sub`、IAM補助リソース |
| `events-and-dlq.yaml` | EventBridge → Lambda、SQS → DLQ |
| `standard-web-application.yaml` | Route Tableで分類するPublic/Private/Isolated Subnet、AZごとのNAT、Regional WAF → ALB → ECS/Fargate、RDS DB Subnet Group、SQS → Lambda |
| `waf-alb-application.yaml` | 関連付け済みAWS WAF → ALB、未関連付けWeb ACLのApplicationDiagram除外 |
| `shared-data.yaml` / `shared-data-consumer.yaml` | ハイフンと`Fn::Sub`、実Stack Parameter値を使うクロスStack Export / ImportValue |

`standard-web-application.yaml`は、一般的なAWS構成の図解精度を確認するローカルのテスト用CFnテンプレートです。Regional WAFはVPC外へ配置し、関連付け先ALBへの赤い`protects`エッジとして表示します。現在のLocalStack構成ではWAF、ECS、RDS、ELBv2を有効化していないため、再作成対象には含めません。構成図生成時にはローカルファイルから読み込み、5つのLocalStack Stackとは別の構成図として保存します。

`waf-alb-application.yaml`は、MIT-0ライセンスの[AWS sample amazon-cloudfront-waf-secretsmanager](https://github.com/aws-samples/amazon-cloudfront-waf-secretsmanager)と[AWS Security Blog](https://aws.amazon.com/blogs/security/how-to-enhance-amazon-cloudfront-origin-security-with-aws-waf-and-aws-secrets-manager/)を参照し、WAFとALBの意味関係だけを残した縮約・改変fixtureです。`AWS::WAFv2::WebACLAssociation`から関連付け済みWeb ACLとALBを解決できること、および未関連付けWeb ACLをApplicationDiagramに表示しないことを単体テストで確認します。外部アーティファクトやLambdaコードは含まず、デプロイ検証の対象にはしません。

`shared-data.yaml`と`shared-data-consumer.yaml`は、実StackのParameter値を含むクロスStack参照を検証するため、LocalStackの再作成対象に含めます。producerを先に、consumerを`DataStack=cfn-diagram-validation-shared-data`で作成します。

## LocalStack

既存の`docker/unit-test.yml`でLocalStackを起動している場合は、次の1コマンドで5つのStackを作成できます。

`docker/unit-test.yml`では、CloudFormationの検証Stackを安定して扱うため、LocalStackのlegacy CloudFormation engineを使用します。また、VPCとEventBridgeを作成するため`ec2`と`events`サービスを有効化しています。設定変更後はLocalStackコンテナを再作成してください。

```sh
cd /path/to/db-drivers/docker
docker compose -f unit-test.yml up -d --force-recreate localstack
```

このスクリプトは冪等です。既存Stackが`CREATE_IN_PROGRESS`、`ROLLBACK_FAILED`、`DELETE_FAILED`などの状態でも、先に削除を試み、削除完了を待ってから再作成します。作成途中で失敗した場合も、対象Stackを削除して終了します。

```sh
cd /path/to/db-drivers
CFN_ENDPOINT=http://localhost:6005 \
  ./scripts/recreate-cfn-validation-stacks-localstack.sh
```

Regionや認証情報を明示したい場合は、環境変数で上書きできます。

```sh
AWS_DEFAULT_REGION=ap-northeast-1 \
AWS_ACCESS_KEY_ID=test \
AWS_SECRET_ACCESS_KEY=test \
CFN_ENDPOINT=http://localhost:6005 \
  ./scripts/recreate-cfn-validation-stacks-localstack.sh
```

LocalStackでは、実際のHTTP呼び出しやイベント配送を確認することより、CloudFormationテンプレートの取得、Export / ImportValue、構成図生成の確認を目的にします。
生成スクリプトは`DescribeStacks`から実際のParameter値も取得し、Parameterを上書きして構築された`Fn::Sub`形式のImportValueを解決します。

### 構成図をMarkdownで確認する

db-notebookを起動せず、LocalStack上の5 Stackとローカルの`standard-web-application.yaml`、`waf-alb-application.yaml`から、それぞれ独立した構成図を生成できます。初回はビルドを行い、その後、各出力ディレクトリの3つのMarkdownファイルをVS CodeのMarkdownプレビューで開くか、draw.ioファイルをdraw.io / diagrams.netで開いてください。

```sh
cd /path/to/db-drivers
npm run diagram:cfn:localstack
```

接続先、Region、認証情報、入力、出力先はテスト用の固定値です。`ApplicationDiagram`、`MultiAzDeploymentTrafficPathsAndProtection`、`CfnDependencyGraph`の3種類を、それぞれ独立したMarkdownファイルに出力します。

同じコマンドで、ApplicationDiagramの編集可能なdraw.io XMLも出力します。draw.io側では、レイヤー、関係種別の色・線種、英語の凡例を確認できます。

LocalStack上の5 Stackは次のファイルへ出力されます。

- `misc/localstack-cfn-validation/application.md`
- `misc/localstack-cfn-validation/multi-az-deployment-traffic-paths-and-protection.md`
- `misc/localstack-cfn-validation/dependency-graph.md`
- `misc/localstack-cfn-validation/application.drawio`
- `misc/localstack-cfn-validation/multi-az-deployment-traffic-paths-and-protection.drawio`
- `misc/localstack-cfn-validation/dependency-graph.drawio`

標準Webテンプレート単独の構成図は次のファイルへ出力されます。

- `misc/standard-web-application-cfn-validation/application.md`
- `misc/standard-web-application-cfn-validation/multi-az-deployment-traffic-paths-and-protection.md`
- `misc/standard-web-application-cfn-validation/dependency-graph.md`
- `misc/standard-web-application-cfn-validation/application.drawio`
- `misc/standard-web-application-cfn-validation/multi-az-deployment-traffic-paths-and-protection.drawio`
- `misc/standard-web-application-cfn-validation/dependency-graph.drawio`

WAF・ALBテンプレート単独の構成図は次のファイルへ出力されます。

- `misc/waf-alb-application-cfn-validation/application.md`
- `misc/waf-alb-application-cfn-validation/multi-az-deployment-traffic-paths-and-protection.md`
- `misc/waf-alb-application-cfn-validation/dependency-graph.md`
- `misc/waf-alb-application-cfn-validation/application.drawio`
- `misc/waf-alb-application-cfn-validation/multi-az-deployment-traffic-paths-and-protection.drawio`
- `misc/waf-alb-application-cfn-validation/dependency-graph.drawio`

### 既にStackが存在する場合

個別に状態を確認したい場合は、次のコマンドを使えます。通常は上記の再作成スクリプトだけを実行すれば十分です。

```sh
aws --endpoint-url "$CFN_ENDPOINT" cloudformation describe-stacks \
  --stack-name cfn-diagram-validation-vpc
```

テンプレートの変更を反映する場合は、`create-stack`ではなく`update-stack`を使います。

```sh
aws --endpoint-url "$CFN_ENDPOINT" cloudformation update-stack \
  --stack-name cfn-diagram-validation-vpc \
  --template-body file://__tests__/data/cfn/validation/vpc-foundation.yaml

aws --endpoint-url "$CFN_ENDPOINT" cloudformation update-stack \
  --stack-name cfn-diagram-validation-api \
  --capabilities CAPABILITY_NAMED_IAM \
  --template-body file://__tests__/data/cfn/validation/api-application.yaml

aws --endpoint-url "$CFN_ENDPOINT" cloudformation update-stack \
  --stack-name cfn-diagram-validation-events \
  --capabilities CAPABILITY_NAMED_IAM \
  --template-body file://__tests__/data/cfn/validation/events-and-dlq.yaml
```

変更がない場合、`update-stack`は`No updates are to be performed`を返しますが、これはエラーではありません。

最初から作り直す場合は、対象Stackを削除してから再作成します。

```sh
aws --endpoint-url "$CFN_ENDPOINT" cloudformation delete-stack \
  --stack-name cfn-diagram-validation-vpc
aws --endpoint-url "$CFN_ENDPOINT" cloudformation wait stack-delete-complete \
  --stack-name cfn-diagram-validation-vpc
```

3つすべてを作り直す場合は、依存関係があるStackを先に削除してください。

```sh
aws --endpoint-url "$CFN_ENDPOINT" cloudformation delete-stack --stack-name cfn-diagram-validation-events
aws --endpoint-url "$CFN_ENDPOINT" cloudformation delete-stack --stack-name cfn-diagram-validation-api
aws --endpoint-url "$CFN_ENDPOINT" cloudformation delete-stack --stack-name cfn-diagram-validation-vpc
```

## 実AWS

AWSへ作成する場合も同じテンプレートを利用できます。APIとEvents StackはIAM Roleを作成するため、`CAPABILITY_NAMED_IAM`が必要です。

```sh
aws cloudformation create-stack \
  --stack-name cfn-diagram-validation-vpc \
  --template-body file://__tests__/data/cfn/validation/vpc-foundation.yaml

aws cloudformation create-stack \
  --stack-name cfn-diagram-validation-api \
  --capabilities CAPABILITY_NAMED_IAM \
  --template-body file://__tests__/data/cfn/validation/api-application.yaml

aws cloudformation create-stack \
  --stack-name cfn-diagram-validation-events \
  --capabilities CAPABILITY_NAMED_IAM \
  --template-body file://__tests__/data/cfn/validation/events-and-dlq.yaml
```

確認後は、作成した3 Stackを削除してください。

```sh
aws cloudformation delete-stack --stack-name cfn-diagram-validation-events
aws cloudformation delete-stack --stack-name cfn-diagram-validation-api
aws cloudformation delete-stack --stack-name cfn-diagram-validation-vpc
```

固定の`RoleName`、`QueueName`、`TableName`を使用しているため、同じAWSアカウント・Regionに同名リソースがある場合は作成前に名前を変更してください。
