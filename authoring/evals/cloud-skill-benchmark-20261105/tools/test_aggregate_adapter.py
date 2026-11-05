import importlib.util,json,sys,tempfile,unittest
from pathlib import Path
scripts=Path(__file__).resolve().parent;sys.path.insert(0,str(scripts))
from aggregate_codex import aggregate
class Adapter(unittest.TestCase):
 def setUp(self):
  self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name);e=self.root/'eval-1-fixture';e.mkdir();(e/'eval_metadata.json').write_text(json.dumps({'eval_id':1,'assertions':['substantive fixture assertion']}))
  for config in ['candidate','baseline']:
   for n in [1,2]:
    p=e/config/f'run-{n}';(p/'outputs').mkdir(parents=True);(p/'outputs/response.md').write_text('fixture output')
    (p/'grading.json').write_text(json.dumps({'expectations':[{'text':'substantive fixture assertion','passed':True,'evidence':'fixture evidence'}],'summary':{'passed':1,'failed':0,'total':1,'pass_rate':1.0},'execution_metrics':{'output_chars':5000}}))
 def tearDown(self): self.temp.cleanup()
 def test_unknown_is_not_zero_or_chars(self):
  result=aggregate(self.root);self.assertEqual(result['metadata']['total_runs'],4);self.assertEqual(result['run_summary']['candidate']['pass_rate']['mean'],1);self.assertIsNone(result['runs'][0]['result']['tokens']);self.assertIsNone(result['runs'][0]['result']['time_seconds']);self.assertNotIn('tokens',result['run_summary']['candidate'])
 def test_reject_invented_totals(self):
  p=self.root/'eval-1-fixture/candidate/run-1/grading.json';d=json.loads(p.read_text());d['summary']['passed']=0;p.write_text(json.dumps(d));self.assertRaises(ValueError,aggregate,self.root)
 def test_reject_missing_run(self):
  p=self.root/'eval-1-fixture/baseline/run-2';p.rename(p.with_name('missing'));self.assertRaises(ValueError,aggregate,self.root)
 def test_reject_changed_assertion(self):
  p=self.root/'eval-1-fixture/candidate/run-1/grading.json';d=json.loads(p.read_text());d['expectations'][0]['text']='weaker replacement';p.write_text(json.dumps(d));self.assertRaises(ValueError,aggregate,self.root)
if __name__=='__main__': unittest.main()
