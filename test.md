```sh

aws logs create-log-group --log-group-name test-log-group --endpoint-url=http://localhost:6005 --profile test

aws logs create-log-stream --log-group-name test-log-group --log-stream-name test-log-stream --endpoint-url=http://localhost:6005 --profile test

aws logs put-log-events --log-group-name test --log-stream-name test2 --log-events timestamp=1681607666426,message='LOG EVENTS 11' --profile cloudberry

{
    "nextSequenceToken": "00000000000000000000000000000000000000000000000000000001",
    "rejectedLogEventsInfo": {
        "tooOldLogEventEndIndex": 0
    }
}

aws logs put-log-events \
        --log-group-name test \
        --log-stream-name test2 \
        --log-events timestamp=1681607696426,message='LOG EVENTS 23' \
        --sequence-token 49639713273617007071072697491034211142326635810749678770  --profile cloudberry

{
    "nextSequenceToken": "00000000000000000000000000000000000000000000000000000002",
    "rejectedLogEventsInfo": {
        "tooOldLogEventEndIndex": 0
    }
}

 aws logs get-log-events --log-group-name test-log-group --log-stream-name test-log-stream --endpoint-url=http://localhost:6005 --profile test

{
    "events": [],
    "nextForwardToken": "f/00000000000000000000000000000000000000000000000000000000",
    "nextBackwardToken": "b/00000000000000000000000000000000000000000000000000000000"
}
```

```sh
aws logs describe-log-streams --log-group-name test --log-stream-name test2 --profile cloudberry
{
    "logStreams": [
        {
            "logStreamName": "test2",
            "creationTime": 1681607603539,
            "firstEventTimestamp": 1681607666426,
            "lastEventTimestamp": 1681607666426,
            "lastIngestionTime": 1681607666729,
            "uploadSequenceToken": "49039859542948432010204560455350998343663879279092483684",
            "arn": "arn:aws:logs:ap-northeast-1:305196851657:log-group:test:log-stream:test2",
            "storedBytes": 0
        }
    ]
}
```
