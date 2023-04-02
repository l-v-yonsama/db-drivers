### キュー作成

```sh
aws sqs create-queue --queue-name test-queue --endpoint-url http://localhost:4566 --profile localstack
{
    "QueueUrl": "http://localhost:4566/000000000000/test-queue"
}
```

### キューの確認

```sh
aws sqs list-queues --endpoint-url http://localhost:4566 --profile test
{
    "QueueUrls": [
        "http://localhost:4566/000000000000/test-queue"
    ]
}

aws sqs get-queue-attributes --queue-url http://localhost:4566/000000000000/test-queue --attribute-names All --endpoint-url http://localhost:4566 --profile test
{
    "Attributes": {
        "ApproximateNumberOfMessages": "0",
        "ApproximateNumberOfMessagesNotVisible": "0",
        "ApproximateNumberOfMessagesDelayed": "0",
        "CreatedTimestamp": "1680266943",
        "DelaySeconds": "0",
        "LastModifiedTimestamp": "1680266943",
        "MaximumMessageSize": "262144",
        "MessageRetentionPeriod": "345600",
        "QueueArn": "arn:aws:sqs:ap-northeast-1:000000000000:test-queue",
        "ReceiveMessageWaitTimeSeconds": "0",
        "VisibilityTimeout": "30"
    }
}
```

## メッセージをキューに送信する

```sh
aws sqs send-message --queue-url "http://localhost:4566/000000000000/test-queue" --message-body "hello sqs" --endpoint-url http://localhost:4566 --profile test
{
    "MD5OfMessageBody": "3b7bef57d06c0021d0aafe8f6d587241",
    "MessageId": "038802bd-8f57-423a-8b66-733ea3b89cbb"
}
```

### キューにあるメッセージ数を確認する

```sh
aws sqs get-queue-attributes --queue-url 'http://localhost:4566/000000000000/test-queue' --attribute-names ApproximateNumberOfMessages --query 'Attributes.ApproximateNumberOfMessages' --endpoint-url http://localhost:4566 --profile test
"1"
```

### メッセージをキューから消費する

```sh
aws sqs receive-message --queue-url 'http://localhost:4566/000000000000/test-queue' --endpoint-url http://localhost:4566 --profile test
{
    "Messages": [
        {
            "MessageId": "038802bd-8f57-423a-8b66-733ea3b89cbb",
            "ReceiptHandle": "MTZkY2U1MDYtN2NjYi00NzZlLTg5MjAtZmRhY2I5NjYzZjlmIGFybjphd3M6c3FzOmFwLW5vcnRoZWFzdC0xOjAwMDAwMDAwMDAwMDp0ZXN0LXF1ZXVlIDAzODgwMmJkLThmNTctNDIzYS04YjY2LTczM2VhM2I4OWNiYiAxNjgwMjY3MzUxLjcxMzU0ODI=",
            "MD5OfBody": "3b7bef57d06c0021d0aafe8f6d587241",
            "Body": "hello sqs"
        }
    ]
}
```

### キューからメッセージを削除する

```sh
# メッセージ削除
aws sqs delete-message --queue-url 'http://localhost:4566/000000000000/test-queue' --receipt-handle "MTZkY2U1MDYtN2NjYi00NzZlLTg5MjAtZmRhY2I5NjYzZjlmIGFybjphd3M6c3FzOmFwLW5vcnRoZWFzdC0xOjAwMDAwMDAwMDAwMDp0ZXN0LXF1ZXVlIDAzODgwMmJkLThmNTctNDIzYS04YjY2LTczM2VhM2I4OWNiYiAxNjgwMjY3MzUxLjcxMzU0ODI=" --endpoint-url http://localhost:4566 --profile test


# メッセージ数確認
aws sqs get-queue-attributes --queue-url 'http://localhost:4566/000000000000/test-queue' --attribute-names ApproximateNumberOfMessages --query 'Attributes.ApproximateNumberOfMessages' --endpoint-url http://localhost:4566 --profile test
"0"
```
