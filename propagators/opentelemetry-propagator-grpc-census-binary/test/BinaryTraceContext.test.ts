/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as assert from 'assert';
import { BinaryTraceContext } from '../src/BinaryTraceContext';
import { SpanContext, TraceFlags } from '@opentelemetry/api';

describe('BinaryTraceContext', () => {
  const commonTraceId = 'd4cda95b652f4a0b92b449d5929fda1b';
  const commonSpanId = '75e8ed491aec7eca';

  const testCases: Array<{
    structured: SpanContext | null;
    binary: Uint8Array;
    description: string;
  }> = [
    {
      structured: {
        traceId: commonTraceId,
        spanId: commonSpanId,
        traceFlags: TraceFlags.SAMPLED,
      },
      binary: new Uint8Array([
        0, 0, 212, 205, 169, 91, 101, 47, 74, 11, 146, 180, 73, 213, 146, 159,
        218, 27, 1, 117, 232, 237, 73, 26, 236, 126, 202, 2, 1,
      ]),
      description: 'span context with 64-bit span ID',
    },
    {
      structured: {
        traceId: commonTraceId,
        spanId: commonSpanId,
        traceFlags: TraceFlags.NONE,
      },
      binary: new Uint8Array([
        0, 0, 212, 205, 169, 91, 101, 47, 74, 11, 146, 180, 73, 213, 146, 159,
        218, 27, 1, 117, 232, 237, 73, 26, 236, 126, 202, 2, 0,
      ]),
      description: 'span context with no traceFlags',
    },
    {
      structured: null,
      binary: new Uint8Array([0, 0]),
      description: 'incomplete binary span context (by returning null)',
    },
    {
      structured: null,
      binary: new Uint8Array(29),
      description: 'bad binary span context (by returning null)',
    },
  ];

  describe('.toBytes()', () => {
    testCases.forEach(
      testCase =>
        testCase.structured &&
        it(`should serialize ${testCase.description}`, () => {
          assert.deepStrictEqual(
            BinaryTraceContext.toBytes(testCase.structured!),
            testCase.binary
          );
        })
    );
  });

  describe('.fromBytes()', () => {
    testCases.forEach(testCase =>
      it(`should deserialize ${testCase.description}`, () => {
        assert.deepStrictEqual(
          BinaryTraceContext.fromBytes(testCase.binary),
          testCase.structured &&
            Object.assign(
              { isRemote: true, traceFlags: TraceFlags.NONE },
              testCase.structured
            )
        );
      })
    );
  });
});
